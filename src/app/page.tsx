import Link from "next/link";
import { Search, GraduationCap, ChevronRight, ArrowLeft, BookOpen, Book, GraduationCap as Cap, Award, Sparkles, ShieldCheck, Presentation, Heart, TrendingUp, Star, Trophy, User, Clock, Download, Eye, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnimatedSection, StaggerContainer, StaggerItem, FloatingElement } from "@/components/ui/animated-section";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ResourceNavigator } from "@/components/home/resource-navigator";
import { LogoAnimation } from "@/components/logo-animation";
import { STATIC_NOTES } from "@/data/static-notes";

export default async function Home() {
  let trendingNotes: any[] = [];
  let recentNotes: any[] = [];
  let topContributor: any = null;

  try {
    const supabase = await createClient();
    
    // Fetch notes first without the broken join
    // Fetch everything needed
    const [trendingRes, recentRes, allNotesRes, allProfilesRes] = await Promise.all([
      supabase.from("notes").select("id, title, subject, year, type, downloads, views, uploaded_by").order("views", { ascending: false }).limit(4),
      supabase.from("notes").select("id, title, subject, year, type, created_at, uploaded_by").order("created_at", { ascending: false }).limit(4),
      supabase.from("notes").select("uploaded_by"),
      supabase.from("profiles").select("id, name, role, department, avatar_url")
    ]);
    
    trendingNotes = trendingRes.data || [];
    recentNotes = recentRes.data || [];
    const allNotes = allNotesRes.data || [];
    const allProfiles = allProfilesRes.data || [];
    const profileMap = new Map(allProfiles.map(p => [p.id, p]));

    // Calculate top contributor
    const counts = allNotes.reduce((acc: Record<string, number>, note) => {
      if (note.uploaded_by) acc[note.uploaded_by] = (acc[note.uploaded_by] || 0) + 1;
      return acc;
    }, {});

    const sortedUserIds = Object.entries(counts)
      .sort(([, a], [, b]) => b - a);

    let topUserId = null;
    for (const [uid] of sortedUserIds) {
      const p = profileMap.get(uid);
      if (p && p.role !== 'admin') {
        topUserId = uid;
        break;
      }
    }

    if (topUserId) {
      topContributor = profileMap.get(topUserId);
    }
    
    // Map profiles to trending/recent notes
    trendingNotes = trendingNotes.map(n => ({ ...n, profiles: profileMap.get(n.uploaded_by) || null }));
    recentNotes = recentNotes.map(n => ({ ...n, profiles: profileMap.get(n.uploaded_by) || null }));

  } catch (error) {
    console.error("Database fetch failed:", error);
  }

  if (!trendingNotes || trendingNotes.length === 0) {
    trendingNotes = STATIC_NOTES.slice(0, 4);
  }
  if (!recentNotes || recentNotes.length === 0) {
    recentNotes = STATIC_NOTES.slice(4, 8);
  }

  return (
    <main className="min-h-screen bg-background transition-colors overflow-hidden">
      {/* Superhuman Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-background z-10" />
          <img 
            src="/campus.jpg" 
            alt="UIT Campus" 
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse z-20" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/10 blur-[120px] animate-pulse z-20" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <StaggerContainer>
            <StaggerItem>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-black text-xs md:text-sm mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 backdrop-blur-md">
                <Sparkles size={16} className="text-red-500 animate-pulse" /> Official Academic Hub for UGI
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <LogoAnimation src="/logo.png" />
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-8 tracking-tighter px-2 leading-[0.9]">
                Empowering <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-red-400 animate-gradient-x">UGI Community.</span>
              </h1>
            </StaggerItem>
          
            <StaggerItem>
              <p className="text-lg md:text-2xl text-slate-200 mb-12 max-w-5xl mx-auto leading-relaxed font-medium px-4 opacity-90">
                The official digital library for **UIT, UCER, UIP, and UIM**. <br className="hidden md:block"/>
                Access verified notes, PYQs, and assignments shared by your campus peers across United Group.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col md:flex-row items-center gap-4 mb-16">
                <form action="/notes" className="w-full md:w-[500px] relative group shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none rounded-2xl md:rounded-full">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="q"
                      placeholder="Search subjects, topics..."
                      className="w-full pl-16 pr-32 py-6 rounded-2xl md:rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 text-lg transition-all dark:text-white outline-none"
                    />
                    <button type="submit" className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-full font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95">
                      Explore
                    </button>
                  </div>
                </form>
                <Link href="/upload" className="w-full md:w-auto px-8 py-6 rounded-2xl md:rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xl shadow-black/5">
                  Share Resources
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Floating Decorative Elements */}
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 hidden xl:block">
            <FloatingElement delay={0}>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="text-emerald-500" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Verified</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Content Quality</p>
                </div>
              </div>
            </FloatingElement>
          </div>

          <div className="absolute top-1/3 right-0 translate-x-1/3 hidden xl:block">
            <FloatingElement delay={1}>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="text-amber-500" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Leaderboard</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Top Contributors</p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </div>
      </section>

      {/* Interactive Resource Navigator */}
      <section className="py-24 relative z-20 -mt-20">
        <ResourceNavigator />
      </section>

      {/* Contributor of the Month */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection direction="up">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-[2rem] p-1 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-all"></div>
            <div className="bg-white dark:bg-slate-900 rounded-[1.9rem] p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="flex-1 text-center md:text-left">
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none mb-4 px-4 py-1.5 font-bold rounded-full uppercase tracking-widest"><Trophy size={14} className="mr-2 inline" /> Contributor of the Month</Badge>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                  {topContributor ? topContributor.name : "Community Star"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                  Recognizing outstanding contributions to the student community. Keep uploading notes to be featured here!
                </p>
                <Link href="/leaderboard" className="inline-flex items-center text-amber-600 dark:text-amber-400 font-bold hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  View full leaderboard <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>
              <Link href={topContributor ? `/profile/${topContributor.id}` : "/leaderboard"} className="flex-shrink-0 relative group/avatar">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-1 transition-transform group-hover/avatar:scale-105">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 overflow-hidden">
                    {topContributor?.avatar_url ? (
                      <img src={topContributor.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-amber-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 border-white dark:border-slate-900 shadow-lg">
                  #1
                </div>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Recommended/Trending Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <AnimatedSection direction="right">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <Sparkles className="mr-3 h-8 w-8 text-amber-500" />
                Recommended For You
              </h2>
            </div>
            <div className="space-y-4">
              {trendingNotes.length > 0 ? trendingNotes.map((item) => (
                <Link key={item.id} href={`/notes/${item.id}`} className="group p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all flex gap-5 items-center overflow-hidden relative shadow-lg shadow-black/5 hover:shadow-indigo-500/10">
                  <div className="h-24 w-28 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-slate-100/50 dark:border-slate-700/50 shadow-inner">
                    {/* Thumbnail logic */}
                    {item.file_url?.toLowerCase().endsWith('.pdf') ? (
                      <div className="absolute inset-0 pointer-events-none scale-[0.4] origin-top-left bg-white">
                        <iframe 
                          src={`${item.file_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="w-[300px] h-[400px] border-none"
                          tabIndex={-1}
                          loading="lazy"
                        />
                      </div>
                    ) : item.file_url?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/) ? (
                      <img src={item.file_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="flex flex-col items-center transition-transform group-hover:scale-110">
                        {item.file_url?.toLowerCase().match(/\.(ppt|pptx)$/) ? (
                          <Presentation size={32} className="text-orange-500" />
                        ) : (
                          <FileText size={32} className="text-indigo-500" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-black text-[9px] uppercase tracking-tighter">
                        {item.type || 'Note'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">
                         {item.year} Year
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors leading-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {item.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 text-[10px] font-black overflow-hidden shrink-0 border border-white dark:border-slate-700">
                        {item.profiles?.avatar_url ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" /> : (item.profiles?.name?.[0] || "S")}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        {item.profiles?.name || 'Student'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 pr-2">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  No resources found yet.
                </div>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection direction="left">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                <Clock className="mr-3 h-8 w-8 text-violet-500" />
                Fresh Uploads
              </h2>
            </div>
            <div className="space-y-4">
              {recentNotes.length > 0 ? recentNotes.map((item) => (
                <Link key={item.id} href={`/notes/${item.id}`} className="group p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all flex gap-5 items-center overflow-hidden relative shadow-lg shadow-black/5 hover:shadow-violet-500/10">
                   <div className="h-24 w-28 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-slate-100/50 dark:border-slate-700/50 shadow-inner">
                    {/* Thumbnail logic */}
                    {item.file_url?.toLowerCase().endsWith('.pdf') ? (
                      <div className="absolute inset-0 pointer-events-none scale-[0.4] origin-top-left bg-white">
                        <iframe 
                          src={`${item.file_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="w-[300px] h-[400px] border-none"
                          tabIndex={-1}
                          loading="lazy"
                        />
                      </div>
                    ) : item.file_url?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/) ? (
                      <img src={item.file_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="flex flex-col items-center transition-transform group-hover:scale-110">
                        {item.file_url?.toLowerCase().match(/\.(ppt|pptx)$/) ? (
                          <Presentation size={32} className="text-orange-500" />
                        ) : (
                          <FileText size={32} className="text-indigo-500" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/5 transition-colors" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none font-black text-[9px] uppercase tracking-tighter">
                        {item.type || 'New'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">
                         Fresh Upload
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white truncate group-hover:text-violet-600 transition-colors leading-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {item.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-violet-600 text-[10px] font-black overflow-hidden shrink-0 border border-white dark:border-slate-700">
                        {item.profiles?.avatar_url ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" /> : (item.profiles?.name?.[0] || "S")}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        {item.profiles?.name || 'Student'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 pr-2">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  No recent uploads yet.
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Community Leaderboard Teaser - Premium Edition */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#4f46e5_0%,transparent_50%)] opacity-20" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#7c3aed_0%,transparent_50%)] opacity-20" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="up">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 md:p-24 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div>
                    <Badge className="bg-red-500/20 text-red-300 border-red-400/20 mb-8 px-6 py-2 font-black rounded-full uppercase tracking-widest text-xs">UGI Community</Badge>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
                      Honoring Our <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-indigo-400">United Scholars.</span>
                    </h2>
                    <p className="text-xl text-indigo-100/60 mb-12 font-medium leading-relaxed max-w-xl">
                      Join the top contributors across UIT, UCER, and UIM. Your knowledge helps 10,000+ United students excel every day.
                    </p>
                    <Link href="/leaderboard" className="inline-flex items-center gap-4 px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 group">
                      Discovery Leaderboard <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: "Top Rank", title: "Study Mentor", val: "#1", icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
                      { label: "Elite", title: "Verified Curator", val: "A+", icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                      { label: "Impact", title: "Resource Hero", val: "10k+", icon: Trophy, color: "text-violet-400", bg: "bg-violet-400/10" },
                      { label: "Growth", title: "Active Learner", val: "🔥", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    ].map((badge, i) => (
                      <div key={i} className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.08] transition-all hover:-translate-y-2 group/card">
                         <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover/card:scale-110", badge.bg)}>
                            <badge.icon className={cn("h-7 w-7", badge.color)} />
                         </div>
                         <p className="text-xs font-black text-indigo-300/50 uppercase tracking-widest mb-2">{badge.label}</p>
                         <h4 className="text-xl font-black text-white leading-tight">{badge.title}</h4>
                         <p className="text-2xl font-black text-white/20 mt-4 group-hover/card:text-white/40 transition-colors">{badge.val}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 relative overflow-hidden bg-indigo-950 text-center">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-black text-white mb-6">Ready to share your knowledge?</h2>
          <p className="text-indigo-200 mb-10 text-lg">Help your batchmates by uploading your verified resources.</p>
          <Link href="/upload" className="inline-flex items-center px-8 py-4 bg-white text-indigo-950 font-black rounded-full hover:scale-105 transition-all text-lg">
            Start Uploading
          </Link>
        </div>
      </section>
    </main>
  );
}
