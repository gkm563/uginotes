"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star, 
  BookOpen, 
  FileText, 
  Layers, 
  ChevronRight,
  MoreVertical,
  Presentation,
  FileStack,
  Clock,
  RefreshCcw,
  ChevronDown
} from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useDebounce } from "@/lib/hooks/use-debounce";
import { NotePreviewModal } from "@/components/note-preview-modal";
import { useRouter } from "next/navigation";
import { STATIC_NOTES } from "@/data/static-notes";

export function NotesListing({ 
  initialSearch = "", 
  initialData = [],
  initialYear = "All",
  initialSemester = "All",
  initialType = "All"
}: { 
  initialSearch?: string;
  initialData?: any[];
  initialYear?: string;
  initialSemester?: string;
  initialType?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [notes, setNotes] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [semesterFilter, setSemesterFilter] = useState(initialSemester);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [profile, setProfile] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sync state when initial props change (e.g. on URL navigation)
  useEffect(() => {
    setSearchTerm(initialSearch);
    setYearFilter(initialYear);
    setSemesterFilter(initialSemester);
    setTypeFilter(initialType);
    setNotes(initialData);
  }, [initialSearch, initialYear, initialSemester, initialType, initialData]);

  const keywordDictionary = [
    "Python", "PyCharm", "PyGame", "Physics", "Physical Chemistry",
    "C Programming", "C++", "Java", "JavaScript", "React",
    "Data Structures", "DBMS", "Database Management", "Data Science",
    "Mathematics", "Machine Learning", "Mechanics",
    "Operating Systems", "Object Oriented Programming",
    "Networking", "Network Security", "Numerical Methods",
    "Artificial Intelligence", "Algorithms", "Automata Theory",
    "Software Engineering", "System Design", "Statistics",
    "Electronics", "Embedded Systems", "Chemistry",
    "Computer Architecture", "Computer Networks",
    "Web Development", "Wireless Communication",
    "Linear Algebra", "Logic Design", "Linux",
    "Thermodynamics", "Theory of Computation",
    "Fluid Mechanics", "SQL",
  ];

  const getKeywordSuggestions = (q: string) => {
    if (!q || q.length < 1) return [];
    return keywordDictionary.filter(k =>
      k.toLowerCase().startsWith(q.toLowerCase()) ||
      k.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 4);
  };

  // Fetch suggestions from DB
  useEffect(() => {
    if (debouncedSearchTerm.length > 1) {
      const fetchSuggestions = async () => {
        const { data } = await supabase
          .from("notes")
          .select("id, title, subject")
          .or(`title.ilike.%${debouncedSearchTerm}%,subject.ilike.%${debouncedSearchTerm}%`)
          .limit(4);
        setSuggestions(data || []);
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  // Sync state with URL when filters change
  const updateUrl = (q: string, y: string, s: string, t: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (y !== "All") params.set("year", y);
    if (s !== "All") params.set("semester", s);
    if (t !== "All") params.set("type", t);
    
    router.push(`/notes?${params.toString()}`, { scroll: false });
  };

  // Sync state when initial props change (e.g. on URL navigation)
  useEffect(() => {
    setSearchTerm(initialSearch);
    setYearFilter(initialYear);
    setSemesterFilter(initialSemester);
    setTypeFilter(initialType);
    if (initialData && initialData.length > 0) {
      setNotes(initialData);
      setHasMore(initialData.length >= PAGE_SIZE);
    }
  }, [initialSearch, initialYear, initialSemester, initialType, initialData]);

  const fetchNotes = async (term?: string, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const search = term ?? searchTerm;
    const year = yearFilter;
    const sem = semesterFilter;
    const type = typeFilter;
    const currentPage = isLoadMore ? page + 1 : 0;
    
    try {
      let query = supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,subject.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (year !== "All") {
        query = query.eq("year", year);
      }

      if (sem !== "All") {
        query = query.eq("semester", parseInt(sem));
      }

      if (type !== "All") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let fetchedNotes = data || [];

      if (fetchedNotes.length === 0) {
        fetchedNotes = STATIC_NOTES.filter(n => {
          let matches = true;
          if (search) {
            const sLower = search.toLowerCase();
            matches = matches && (n.title.toLowerCase().includes(sLower) || n.subject.toLowerCase().includes(sLower) || n.description.toLowerCase().includes(sLower));
          }
          if (year !== "All") {
            const normYear = year.replace(/(st|nd|rd|th)/gi, "");
            matches = matches && (n.year === year || n.year?.toString().replace(/(st|nd|rd|th)/gi, "") === normYear);
          }
          if (sem !== "All") matches = matches && n.semester === parseInt(sem);
          if (type !== "All") matches = matches && n.type === type;
          return matches;
        });
      }
      
      const uploaderIds = Array.from(new Set(fetchedNotes.map((n: any) => n.uploaded_by).filter(Boolean)));
      if (uploaderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, role, avatar_url")
          .in("id", uploaderIds);
          
        if (profilesData) {
          const profileMap = new Map(profilesData.map((p: any) => [p.id, p]));
          fetchedNotes = fetchedNotes.map((n: any) => ({ ...n, profiles: profileMap.get(n.uploaded_by) || null }));
        }
      }

      if (isLoadMore) {
        setNotes(prev => [...prev, ...fetchedNotes]);
        setPage(currentPage);
      } else {
        setNotes(fetchedNotes);
        setPage(0);
      }
      
      setHasMore(fetchedNotes.length === PAGE_SIZE);
    } catch (error: any) {
      console.error("Supabase Fetch Error:", error);
      toast.error("Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Skip fetch if we already have initial data from server
      if (initialData && initialData.length > 0) return;
    }
    fetchNotes();
  }, [yearFilter, semesterFilter, typeFilter, debouncedSearchTerm]);

  // Personalization: Fetch profile and set filters if not already set
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
          // If no filters are explicitly set in URL, use profile defaults
          if (initialYear === "All" && initialSemester === "All") {
            if (data.year) setYearFilter(data.year);
            if (data.semester) setSemesterFilter(data.semester.toString());
          }
        }
      }
    };
    getProfile();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    updateUrl(searchTerm, yearFilter, semesterFilter, typeFilter);
    fetchNotes();
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Toggle & Search Header */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 h-14 rounded-2xl font-bold flex gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/10"
          >
            <Filter size={18} className="text-indigo-600" /> {showMobileFilters ? "Hide Filters" : "Filters"}
          </Button>
          <Button 
            variant="outline" 
            className="h-14 w-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/10 flex items-center justify-center"
            onClick={() => {setSearchTerm(""); fetchNotes("");}}
          >
            <RefreshCcw size={18} className="text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Sidebar Filters */}
      <aside className={cn(
        "w-full lg:w-72 space-y-6 flex-shrink-0 transition-all duration-300",
        !showMobileFilters && "hidden lg:block"
      )}>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h3 className="font-black text-slate-900 dark:text-white mb-6 flex items-center text-lg tracking-tight">
            <Filter size={20} className="mr-3 text-indigo-600" /> Refine Search
          </h3>
          
          <div className="space-y-6">
            {/* Year & Semester combined on mobile */}
            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                  <Select value={yearFilter} onValueChange={(val: string | null) => {const v = val || "All"; setYearFilter(v); updateUrl(searchTerm, v, semesterFilter, typeFilter); if(window.innerWidth < 1024) setShowMobileFilters(false);}}>
                     <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                        <SelectValue placeholder="Select Year" />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-2xl">
                        <SelectItem value="All" className="py-3">All Years</SelectItem>
                        <SelectItem value="1st" className="py-3">1st Year</SelectItem>
                        <SelectItem value="2nd" className="py-3">2nd Year</SelectItem>
                        <SelectItem value="3rd" className="py-3">3rd Year</SelectItem>
                        <SelectItem value="4th" className="py-3">4th Year</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                  <Select value={semesterFilter} onValueChange={(val: string | null) => {const v = val || "All"; setSemesterFilter(v); updateUrl(searchTerm, yearFilter, v, typeFilter); if(window.innerWidth < 1024) setShowMobileFilters(false);}}>
                     <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                        <SelectValue placeholder="Select Semester" />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-2xl">
                        <SelectItem value="All" className="py-3">All Semesters</SelectItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <SelectItem key={s} value={s.toString()} className="py-3">Semester {s}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Type</label>
               <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {["All", "Notes", "Assignment", "PYQ", "Lab Manual"].map((t) => (
                    <button
                      key={t}
                      onClick={() => {setTypeFilter(t); updateUrl(searchTerm, yearFilter, semesterFilter, t); if(window.innerWidth < 1024) setShowMobileFilters(false);}}
                      className={cn(
                        "text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between group",
                        typeFilter === t 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        {t === "All" ? "All" : t}
                      </span>
                      {typeFilter === t && <ChevronRight size={12} className="hidden lg:block" />}
                    </button>
                  ))}
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
               <Button 
                  variant="ghost" 
                  onClick={() => {setYearFilter("All"); setSemesterFilter("All"); setTypeFilter("All"); setSearchTerm(""); updateUrl("", "All", "All", "All"); setShowMobileFilters(false);}}
                  className="w-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl font-black text-xs uppercase"
               >
                  Reset Filters
               </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow space-y-6 md:space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/20 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="absolute left-4 md:left-6 text-slate-400" size={20} />
              <Input 
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search subjects..."
                className="pl-12 md:pl-16 pr-24 md:pr-32 h-12 md:h-16 text-sm md:text-lg border-none focus-visible:ring-0 bg-transparent"
              />
              <Button type="submit" className="absolute right-1 md:right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-2xl h-10 md:h-12 px-4 md:px-8 font-black text-xs md:text-base shadow-lg shadow-indigo-500/20">
                Search
              </Button>
            </form>
          </div>

          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && searchTerm.length > 0 && (getKeywordSuggestions(searchTerm).length > 0 || suggestions.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl z-[110] overflow-hidden"
              >
                {/* Keyword chip suggestions */}
                {getKeywordSuggestions(searchTerm).length > 0 && (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {getKeywordSuggestions(searchTerm).map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => {
                            setSearchTerm(keyword);
                            setShowSuggestions(false);
                            updateUrl(keyword, yearFilter, semesterFilter, typeFilter);
                            fetchNotes(keyword);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800/50"
                        >
                          <Search size={12} />{keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DB note results */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Notes</p>
                    {suggestions.map((s) => (
                      <button 
                        key={s.id}
                        onClick={() => {
                          setSearchTerm(s.title);
                          setShowSuggestions(false);
                          updateUrl(s.title, yearFilter, semesterFilter, typeFilter);
                          fetchNotes(s.title);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition-all group"
                      >
                        <div className="h-8 w-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:border-indigo-200 shrink-0">
                          <FileText size={15} className="text-slate-400 group-hover:text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{s.title}</p>
                          <p className="text-xs font-medium text-slate-400 truncate">{s.subject}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-[340px] bg-white/50 dark:bg-slate-800/50 rounded-[2rem] animate-pulse border border-slate-200/50 dark:border-slate-700/50" />
            ))}
          </div>
        ) : notes.length > 0 ? (
            <>
            {/* Active Filters Display */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
               {(yearFilter !== "All" || semesterFilter !== "All" || typeFilter !== "All") && (
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="text-xs font-black uppercase text-slate-400 tracking-widest mr-2">Filters:</span>
                     {yearFilter !== "All" && <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1 font-bold">{yearFilter} Year</Badge>}
                     {semesterFilter !== "All" && <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1 font-bold">Sem {semesterFilter}</Badge>}
                     {typeFilter !== "All" && <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1 font-bold">{typeFilter}</Badge>}
                     <button onClick={() => {setYearFilter("All"); setSemesterFilter("All"); setTypeFilter("All"); updateUrl(searchTerm, "All", "All", "All");}} className="text-xs font-black text-rose-500 hover:underline ml-2 uppercase">Clear All</button>
                  </div>
               )}
               <div className="ml-auto text-sm font-bold text-slate-400">
                  {loading ? "Searching..." : `Showing ${notes.length} resources`}
               </div>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {notes.map((note) => (
              <StaggerItem key={note.id}>
                <Link href={`/notes/${note.id}`} className="group block h-full">
                  <Card className="h-full border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col">
                    <CardHeader className="relative p-6 pb-4">
                      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end z-10">
                         <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 border-none rounded-xl px-3 py-1 font-black shadow-md shadow-indigo-900/20">
                           {note.year} Year
                         </Badge>
                         <Badge variant="outline" className="bg-white dark:bg-slate-800 border-none text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1 shadow-md shadow-slate-900/10 font-bold">
                           {note.type}
                         </Badge>
                      </div>
                      
                      <div className="h-32 w-full bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:from-indigo-50 group-hover:to-violet-50 dark:group-hover:from-indigo-900/20 dark:group-hover:to-violet-900/20 transition-colors relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50 z-0" />
                         
                         <div className="relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-md">
                           {note.file_url?.toLowerCase().endsWith('.pdf') ? (
                             <FileText size={48} strokeWidth={1.5} className="text-indigo-400 dark:text-indigo-500" />
                           ) : note.file_url?.toLowerCase().match(/\.(ppt|pptx)$/) ? (
                             <Presentation size={48} strokeWidth={1.5} className="text-orange-400 dark:text-orange-500" />
                           ) : note.file_url?.toLowerCase().match(/\.(doc|docx)$/) ? (
                             <FileStack size={48} strokeWidth={1.5} className="text-blue-400 dark:text-blue-500" />
                           ) : (
                             <FileText size={48} strokeWidth={1.5} className="text-indigo-400 dark:text-indigo-500" />
                           )}
                         </div>
                      </div>
                      
                      <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 line-clamp-1">
                        {note.subject}
                      </p>
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {note.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 flex-grow">
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {note.description || "Comprehensive resource uploaded for this subject. Click to view detailed AI summary and preview."}
                      </p>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 mt-auto">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex gap-4">
                          <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                            <Download size={14} className="mr-1.5 text-indigo-500" /> {note.downloads || 0}
                          </div>
                          <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                            <Star size={14} className="mr-1.5 text-amber-500 fill-amber-500" /> {note.average_rating || 0}
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                          <ChevronRight size={16} className="text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 w-full">
                          <div 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/profile/${note.uploaded_by}`);
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                             <div className="h-6 w-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 text-[10px] overflow-hidden shrink-0">
                                {/* @ts-ignore */}
                                {note.profiles?.avatar_url ? <img src={note.profiles.avatar_url} className="w-full h-full object-cover" alt="Profile" /> : note.profiles?.role === 'admin' ? "A" : (note.profiles?.name?.[0] || "S")}
                             </div>
                             <span className="truncate">
                               {note.profiles?.role === 'admin' ? "System Admin - NotesBazi" : (note.profiles?.name || "Student")}
                             </span>
                          </div>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
            </StaggerContainer>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                 <Button 
                   onClick={() => fetchNotes(searchTerm, true)} 
                   disabled={loadingMore}
                   className="h-16 px-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xl transition-all flex gap-3"
                 >
                   {loadingMore ? (
                     <>
                       <RefreshCcw className="animate-spin" size={20} /> Loading...
                     </>
                   ) : (
                     <>
                       Load More Resources <ChevronDown size={20} />
                     </>
                   )}
                 </Button>
              </div>
            )}
            </>
        ) : (
          <div className="py-32 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="h-24 w-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
               <Search size={40} className="text-indigo-300 dark:text-indigo-700" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No resources found</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md">
              We couldn't find anything matching your filters. Try adjusting your search criteria or contribute by uploading!
            </p>
            <Button variant="outline" onClick={() => {setYearFilter("All"); setTypeFilter("All"); setSearchTerm("");}} className="mt-8 rounded-full px-8 py-6 border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
