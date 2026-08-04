'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import { parseMaterials, parseColors, serializeMaterials, serializeColors, DEFAULT_MATERIALS, DEFAULT_COLORS, type MaterialOption, type ColorOption } from '@/lib/productOptions';
import { DEFAULT_PRODUCT_CONFIG, parseProductConfig, parseSizesExtended, serializeSizesExtended, type ProductPageConfig, type ExtendedSizeOption } from '@/lib/productConfig';
import { BarChart3, MessageSquare, Star, MessageCircle, Edit, PlusCircle, Trash2, Check, CheckSquare, Menu, X, ExternalLink, Users, Settings, BookOpen, ListOrdered, ChevronRight, Package, Home, Bell, Moon, Sun, Globe, Tag, Shield, ShieldOff, Phone, Mail, Clock, Filter, ArrowUpDown, ChevronDown, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LuxSelect from '@/components/ui/LuxSelect';

// ── Variants ──────────────────────────────────────────────────────────────────
const EASE = [0.22,1,0.36,1] as const;
const PAGE  = { hidden:{ opacity:0, y:14 }, visible:{ opacity:1, y:0, transition:{ duration:0.28, ease:EASE } }, exit:{ opacity:0, y:-8, transition:{ duration:0.18 } } };
const GRID  = { hidden:{}, visible:{ transition:{ staggerChildren:0.06, delayChildren:0.03 } } };
const CARD  = { hidden:{ opacity:0, y:10, scale:0.98 }, visible:{ opacity:1, y:0, scale:1, transition:{ duration:0.26, ease:EASE } } };
const FADE  = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ duration:0.22 } } };
const ROW   = { hidden:{ opacity:0, x:-8 }, visible:{ opacity:1, x:0, transition:{ duration:0.22, ease:EASE } } };
const MODAL = { hidden:{ opacity:0, scale:0.96, y:12 }, visible:{ opacity:1, scale:1, y:0, transition:{ duration:0.26, ease:EASE } }, exit:{ opacity:0, scale:0.97, y:8, transition:{ duration:0.18 } } };

// ── Types ─────────────────────────────────────────────────────────────────────
type S = 'dashboard'|'analytics'|'inventory'|'inquiries'|'moderation'|'blog'|'users'|'vouchers'|'settings';

interface Props {
  adminEmail:string; adminName:string; adminAvatar:string|null;
  categories:any[]; initialProducts:any[]; initialInquiries:any[];
  initialReviews:any[]; initialApprovedReviews:any[]; initialComments:any[];
  events:any[]; initialBlogPosts:any[]; blogCategories:any[]; allProfiles:any[];
  initialVouchers:any[];
}

const NAV = [
  { group:'Overview',    items:[{ id:'dashboard',  label:'Dashboard',  icon:Home },     { id:'analytics', label:'Analytics',  icon:BarChart3 }] },
  { group:'Store',       items:[{ id:'inventory',  label:'Products',   icon:Package },  { id:'inquiries', label:'Inquiries',  icon:MessageSquare }] },
  { group:'Content',     items:[{ id:'blog',       label:'Blog',       icon:BookOpen }, { id:'moderation',label:'Moderation', icon:ListOrdered }] },
  { group:'Manage',      items:[{ id:'users',      label:'Users',      icon:Users },    { id:'vouchers',  label:'Vouchers',   icon:Tag },           { id:'settings',  label:'Settings',   icon:Settings }] },
];
const TITLES:Record<S,string> = { dashboard:'Dashboard', analytics:'Analytics', inventory:'Products', inquiries:'Inquiries', moderation:'Moderation', blog:'Blog', users:'Users', vouchers:'Vouchers', settings:'Settings' };

// ── Shared input/label CSS helper ────────────────────────────────────────────
const INP = "adm-input";
const LBL = "block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5";

export default function AdminClient({ adminEmail, adminName, adminAvatar, categories, initialProducts, initialInquiries, initialReviews, initialApprovedReviews, initialComments, events, initialBlogPosts, blogCategories, allProfiles, initialVouchers }: Props) {
  const { addToast } = useUIStore();

  // ── Layout ────────────────────────────────────────
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [section,      setSection]      = useState<S>('dashboard');
  const [theme, setTheme] = useState<'light'|'dark'>(() => typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  // ── Data ──────────────────────────────────────────
  const [products,        setProducts]        = useState<any[]>(initialProducts);
  const [inquiries,       setInquiries]       = useState<any[]>(initialInquiries);
  const [reviews,         setReviews]         = useState<any[]>(initialReviews);
  const [approvedReviews, setApprovedReviews] = useState<any[]>(initialApprovedReviews);
  const [comments,        setComments]        = useState<any[]>(initialComments);
  const [blogPosts,       setBlogPosts]       = useState<any[]>(initialBlogPosts);
  const [profiles,        setProfiles]        = useState<any[]>(allProfiles);

  // ── Voucher state ─────────────────────────────────
  const [vouchers,        setVouchers]        = useState<any[]>(initialVouchers);
  const [showVoucher,     setShowVoucher]     = useState(false);
  const [editVoucher,     setEditVoucher]     = useState<any|null>(null);
  const [vCode,setVCode]=useState(''); const [vDesc,setVDesc]=useState('');
  const [vType,setVType]=useState<'percentage'|'fixed_amount'>('percentage');
  const [vValue,setVValue]=useState(10); const [vMin,setVMin]=useState(0);
  const [vMax,setVMax]=useState(0); const [vMaxUses,setVMaxUses]=useState(0);
  const [vExpiry,setVExpiry]=useState(''); const [vActive,setVActive]=useState(true);
  const [voucherSearch, setVoucherSearch] = useState('');

  // ── Users panel state ─────────────────────────────
  const [selectedUser,    setSelectedUser]    = useState<any|null>(null);
  const [userInquiries,   setUserInquiries]   = useState<any[]>([]);
  const [userPanelLoading,setUserPanelLoading]= useState(false);
  const [userSearch,      setUserSearch]      = useState('');

  // ── Product form ──────────────────────────────────
  const [showProd, setShowProd] = useState(false);
  const [editProd, setEditProd] = useState<any|null>(null);
  const [pName,setPName]=useState(''); const [pSku,setPSku]=useState('');
  const [pDesc,setPDesc]=useState(''); const [pShort,setPShort]=useState('');
  const [pPrice,setPPrice]=useState(1500); const [pWeight,setPWeight]=useState('1.5 kg');
  const [pCat,setPCat]=useState(categories[0]?.id||'');
  const [pSizes,setPSizes]=useState<ExtendedSizeOption[]>([{value:'12 x 15 inches',modifier:0,label:'12 x 15 in',tag:'Standard'}]);
  const [pMats,setPMats]=useState<MaterialOption[]>([...DEFAULT_MATERIALS]);
  const [pCols,setPCols]=useState<ColorOption[]>([...DEFAULT_COLORS]);
  const [pConfig,setPConfig]=useState<ProductPageConfig>({...DEFAULT_PRODUCT_CONFIG});
  const [pImgs,setPImgs]=useState<string[]>(['']);
  const [pCustom,setPCustom]=useState(true); const [pFeat,setPFeat]=useState(false);
  const [pTrend,setPTrend]=useState(false); const [pBest,setPBest]=useState(false);
  const [pTags,setPTags]=useState(''); const [pSeoT,setPSeoT]=useState(''); const [pSeoD,setPSeoD]=useState('');
  const [delConf, setDelConf] = useState<{type:'product'|'blog'|'review',id:string}|null>(null);

  // ── Blog form ─────────────────────────────────────
  const [showBlog,setShowBlog]=useState(false); const [editBlog,setEditBlog]=useState<any|null>(null);
  const [bTitle,setBTitle]=useState(''); const [bSlug,setBSlug]=useState('');
  const [bContent,setBContent]=useState(''); const [bCat,setBCat]=useState(blogCategories[0]?.id||'');
  const [bTime,setBTime]=useState(5); const [bImg,setBImg]=useState('');
  const [bTags,setBTags]=useState(''); const [bSeoT,setBSeoT]=useState(''); const [bSeoD,setBSeoD]=useState('');
  const [bPub,setBPub]=useState(true);

  // ── Misc ──────────────────────────────────────────
  const [replyId,setReplyId]=useState<string|null>(null); const [replyTxt,setReplyTxt]=useState('');
  const [loading,setLoading]=useState(false); const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [iqFilter,setIqFilter]=useState<'all'|'pending'|'replied'|'closed'>('all');
  const [settTab,setSettTab]=useState<'general'|'seo'|'notifications'>('general');

  // ── Analytics ────────────────────────────────────
  const totalViews  = events.filter(e=>e.event_type==='page_view'||e.event_type==='product_click').length;
  const totalClicks = events.filter(e=>e.event_type==='whatsapp_click').length;
  const cvr = totalViews>0?((totalClicks/totalViews)*100).toFixed(1):'0.0';
  const traffic = Array.from({length:7}).map((_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
    return { date:ds, views:events.filter(e=>new Date(e.created_at).toDateString()===d.toDateString()&&(e.event_type==='page_view'||e.event_type==='product_click')).length, clicks:events.filter(e=>new Date(e.created_at).toDateString()===d.toDateString()&&e.event_type==='whatsapp_click').length };
  }).reverse();
  const devMap:Record<string,number>={};
  events.forEach(e=>{ if(e.device) devMap[e.device]=(devMap[e.device]||0)+1; });
  const devData=Object.entries(devMap).map(([name,value])=>({name,value}));
  if(!devData.length) devData.push({name:'Desktop',value:1});
  const srchMap:Record<string,number>={};
  events.forEach(e=>{ if(e.event_type==='search'&&e.search_query) srchMap[e.search_query]=(srchMap[e.search_query]||0)+1; });
  const topSearches=Object.entries(srchMap).map(([query,count])=>({query,count})).sort((a,b)=>b.count-a.count).slice(0,6);

  const pendingMod = reviews.length+comments.length;
  const pendingIq  = inquiries.filter(i=>i.status==='pending').length;

  // ── Helpers ───────────────────────────────────────
  const go=(s:S)=>{ setSection(s); setMobileOpen(false); };

  const toggleTheme=()=>{
    const n=theme==='light'?'dark':'light';
    setTheme(n);
    document.documentElement.classList.toggle('dark',n==='dark');
    localStorage.setItem('theme',n);
  };

  const refreshProds=async()=>{ const r=await(await fetch('/api/products')).json(); if(r.data) setProducts(r.data); };
  const refreshBlogs=async()=>{ const {supabase}=await import('@/lib/supabase/client'); const {data}=await supabase.from('blog_posts').select('*,category:blog_categories(name)').order('created_at',{ascending:false}); if(data) setBlogPosts(data); };

  // ── Inquiry ───────────────────────────────────────
  const iqStatus=async(id:string,status:'replied'|'closed')=>{
    try{ const r=await(await fetch('/api/inquiries',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})})).json();
    setInquiries(inquiries.map(i=>i.id===id?{...i,status}:i)); addToast('Status updated.','success');
    }catch(e:any){ addToast(e.message,'error'); }
  };

  // ── Moderation ────────────────────────────────────
  const modReview=async(id:string,action:'approve'|'reject')=>{
    try{ await fetch('/api/admin/moderation',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'review',id,action})});
    setReviews(reviews.filter(r=>r.id!==id)); addToast(action==='approve'?'Approved.':'Rejected.','success');
    }catch(e:any){ addToast(e.message,'error'); }
  };
  const modComment=async(id:string,action:'approve'|'reject')=>{
    try{ await fetch('/api/admin/moderation',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'comment',id,action})});
    setComments(comments.filter(c=>c.id!==id)); addToast(action==='approve'?'Approved.':'Rejected.','success');
    }catch(e:any){ addToast(e.message,'error'); }
  };
  const modReply=async(e:React.FormEvent,cmt:any)=>{
    e.preventDefault(); if(!replyTxt.trim()) return;
    try{ setLoading(true);
    await fetch('/api/admin/moderation',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'comment',id:cmt.id,action:'reply',reply:replyTxt})});
    setComments(comments.filter(c=>c.id!==cmt.id)); setReplyTxt(''); setReplyId(null); addToast('Reply posted.','success');
    }catch(err:any){ addToast(err.message,'error'); }finally{ setLoading(false); }
  };
  const featToggle=async(id:string,cur:boolean)=>{
    try{ const featured=!cur;
    await fetch('/api/admin/moderation',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'feature',id,featured})});
    setProducts(products.map(p=>p.id===id?{...p,is_featured:featured}:p)); addToast(featured?'Featured.':'Unfeatured.','success');
    }catch(e:any){ addToast(e.message,'error'); }
  };

  // ── Product CRUD ──────────────────────────────────
  const openProd=(p:any|null=null)=>{
    setEditProd(p);
    if(p){ setPName(p.name);setPSku(p.sku||'');setPDesc(p.description||'');setPShort(p.short_description||'');setPPrice(p.price||0);
      const imgs=(p.product_images||[]).sort((a:any,b:any)=>(a.display_order??0)-(b.display_order??0)).map((i:any)=>i.image_url);
      setPImgs(imgs.length?imgs:['']); setPSizes(parseSizesExtended(p.dimensions)); setPMats(parseMaterials(p.material));
      setPCols(parseColors(p.color)); setPConfig(parseProductConfig(p.product_config)); setPWeight(p.weight||'');
      setPCat(p.category_id||categories[0]?.id||''); setPCustom(p.is_customizable||false); setPFeat(p.is_featured||false);
      setPTrend(p.is_trending||false); setPBest(p.is_best_seller||false);
      setPTags(p.tags?p.tags.join(', '):''); setPSeoT(p.seo_title||''); setPSeoD(p.seo_description||'');
    } else {
      setPName('');setPSku('');setPDesc('');setPShort('');setPPrice(1500);setPImgs(['']);
      setPSizes([{value:'12 x 15 inches',modifier:0,label:'12 x 15 in',tag:'Standard'}]);
      setPMats([...DEFAULT_MATERIALS]);setPCols([...DEFAULT_COLORS]);setPConfig({...DEFAULT_PRODUCT_CONFIG});
      setPWeight('1.5 kg');setPCat(categories[0]?.id||'');setPCustom(true);setPFeat(false);setPTrend(false);setPBest(false);
      setPTags('');setPSeoT('');setPSeoD('');
    }
    setShowProd(true);
  };

  const saveProd=async(e:React.FormEvent)=>{
    e.preventDefault(); setSaving(true);
    try{
      const slug=editProd?editProd.slug:pName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const payload={ name:pName,slug,sku:pSku||null,description:pDesc,short_description:pShort,price:pPrice,
        dimensions:serializeSizesExtended(pSizes),material:serializeMaterials(pMats),color:serializeColors(pCols),
        weight:pWeight,category_id:pCat||null,tags:pTags.split(',').map(t=>t.trim()).filter(Boolean),
        is_customizable:pCustom,is_featured:pFeat,is_trending:pTrend,is_best_seller:pBest,
        seo_title:pSeoT||null,seo_description:pSeoD||null,product_config:pConfig };
      const imageUrls=pImgs.map(u=>u.trim()).filter(Boolean);
      const body=editProd?JSON.stringify({id:editProd.id,product:payload,imageUrls,previousSlug:editProd.slug}):JSON.stringify({product:payload,imageUrls});
      const res=await fetch('/api/products',{method:editProd?'PATCH':'POST',headers:{'Content-Type':'application/json'},body});
      const r=await res.json(); if(!res.ok) throw new Error(r.error);
      addToast(editProd?'Product updated.':'Product created.','success'); await refreshProds(); setShowProd(false);
    }catch(err:any){ addToast(err.message,'error'); }finally{ setSaving(false); }
  };

  const confirmDel=async()=>{
    if(!delConf) return; const {type,id}=delConf; setDelConf(null);
    try{
      if(type==='product'){ const r=await(await fetch(`/api/products?id=${id}`,{method:'DELETE'})).json(); if(r.error) throw new Error(r.error); setProducts(products.filter(p=>p.id!==id)); addToast('Deleted.','success'); }
      else if(type==='blog'){ const r=await(await fetch(`/api/blog?id=${id}`,{method:'DELETE'})).json(); if(r.error) throw new Error(r.error); setBlogPosts(blogPosts.filter(b=>b.id!==id)); addToast('Deleted.','success'); }
      else if(type==='review'){ await fetch('/api/admin/moderation',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'review',id,action:'reject'})}); setApprovedReviews(approvedReviews.filter(r=>r.id!==id)); addToast('Review removed.','success'); }
    }catch(e:any){ addToast(e.message,'error'); }
  };

  // ── Blog CRUD ─────────────────────────────────────
  const openBlog=(p:any|null=null)=>{
    setEditBlog(p);
    if(p){ setBTitle(p.title);setBSlug(p.slug);setBContent(p.content||'');setBCat(p.category_id||blogCategories[0]?.id||'');
      setBTime(p.reading_time||5);setBImg(p.featured_image||'');setBTags(p.tags?p.tags.join(', '):'');
      setBSeoT(p.seo_title||'');setBSeoD(p.seo_description||'');setBPub(p.is_published??true);
    } else { setBTitle('');setBSlug('');setBContent('');setBCat(blogCategories[0]?.id||'');setBTime(5);setBImg('');setBTags('');setBSeoT('');setBSeoD('');setBPub(true); }
    setShowBlog(true);
  };

  const saveBlog=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true);
    try{
      const slug=bSlug.trim()||bTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const post={title:bTitle,slug,content:bContent,category_id:bCat||null,reading_time:bTime,featured_image:bImg||null,tags:bTags.split(',').map(t=>t.trim()).filter(Boolean),seo_title:bSeoT||null,seo_description:bSeoD||null,is_published:bPub};
      const body=editBlog?JSON.stringify({id:editBlog.id,post}):JSON.stringify({post});
      const res=await fetch('/api/blog',{method:editBlog?'PATCH':'POST',headers:{'Content-Type':'application/json'},body});
      const r=await res.json(); if(!res.ok) throw new Error(r.error);
      addToast(editBlog?'Post updated.':'Post published.','success'); await refreshBlogs(); setShowBlog(false);
    }catch(err:any){ addToast(err.message,'error'); }finally{ setLoading(false); }
  };

  const roleChange=async(profileId:string,role:'user'|'admin')=>{
    try{ const {supabase}=await import('@/lib/supabase/client');
    const {error}=await supabase.from('profiles').update({role}).eq('id',profileId);
    if(error) throw error; setProfiles(profiles.map(p=>p.id===profileId?{...p,role}:p)); addToast(`Role → ${role}`,'success');
    }catch(e:any){ addToast(e.message,'error'); }
  };

  // ── Sidebar inner ─────────────────────────────────
  const Sidebar = ({ mobile=false }:{mobile?:boolean}) => {
    const exp = mobile || sidebarOpen;
    return (
      <div className="flex flex-col h-full" style={{background:'var(--adm-sidebar)',borderRight:'1px solid var(--adm-border)'}}>
        {/* Brand */}
        <div className="flex items-center px-4 py-3.5" style={{borderBottom:'1px solid rgba(255,255,255,0.08)', minHeight: '3.25rem'}}>
          <AnimatePresence>
          {exp && (
            <motion.div initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}} exit={{opacity:0,width:0}} transition={{duration:0.2}} className="overflow-hidden min-w-0">
              <p className="text-[0.75rem] font-semibold truncate leading-tight whitespace-nowrap text-white">Admin</p>
              <p className="text-[0.6rem] whitespace-nowrap" style={{color:'var(--adm-text3)'}}>Chandan Art Gallery</p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {NAV.map(g=>(
            <div key={g.group}>
              <AnimatePresence>
              {exp && (
                <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}
                  className="text-[0.6rem] font-medium uppercase tracking-wider px-2 mb-1.5 whitespace-nowrap overflow-hidden"
                  style={{color:'#52525b'}}>
                  {g.group}
                </motion.p>
              )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {g.items.map(item=>{
                  const Icon=item.icon; const active=section===item.id;
                  const badge=item.id==='moderation'?pendingMod:item.id==='inquiries'?pendingIq:0;
                  return (
                    <button key={item.id} onClick={()=>go(item.id as S)}
                      title={!exp?item.label:undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left ${active?'adm-sidebar-item active':'adm-sidebar-item'}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{color:active?'#fafafa':'#71717a'}} />
                      <AnimatePresence>
                      {exp && (
                        <motion.span initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}} exit={{opacity:0,width:0}} transition={{duration:0.18}}
                          className="flex items-center gap-1.5 flex-1 overflow-hidden whitespace-nowrap">
                          <span className="text-[0.8rem] font-medium flex-1">{item.label}</span>
                          {badge>0 && (
                            <span className="min-w-5 h-5 px-1 rounded text-[0.6rem] font-semibold flex items-center justify-center flex-shrink-0"
                              style={{background:'#3f3f46',color:'#fafafa'}}>
                              {badge>9?'9+':badge}
                            </span>
                          )}
                        </motion.span>
                      )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        {/* Bottom */}
        <div className="px-2.5 py-3 space-y-0.5" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <Link href="/" target="_blank" className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md adm-sidebar-item" title={!exp?'View store':undefined}>
            <Globe className="w-4 h-4 flex-shrink-0" style={{color:'#71717a'}} />
            <AnimatePresence>
            {exp && (
              <motion.span initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}} exit={{opacity:0,width:0}} transition={{duration:0.18}} className="flex items-center gap-1 flex-1 overflow-hidden whitespace-nowrap">
                <span className="text-[0.78rem] font-medium flex-1">View store</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </motion.span>
            )}
            </AnimatePresence>
          </Link>
          <AnimatePresence>
          {exp && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="flex items-center gap-2.5 px-2.5 py-2">
              {adminAvatar
                ? <img src={adminAvatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                : <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'#27272a'}}>
                    <span className="text-[0.62rem] font-semibold text-neutral-300">{adminName[0]?.toUpperCase()}</span>
                  </div>
              }
              <div className="min-w-0 flex-1">
                <p className="text-[0.72rem] font-medium truncate text-neutral-300">{adminName}</p>
                <p className="text-[0.58rem] truncate" style={{color:'var(--adm-text3)'}}>{adminEmail}</p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // ── Reusable section header ───────────────────────
  const SectionHead = ({title,sub}:{title:string,sub:string}) => (
    <div className="mb-1">
      <h2 className="text-lg font-semibold tracking-tight mb-0.5" style={{color:'var(--adm-text)'}}>{title}</h2>
      <p className="text-[0.8rem]" style={{color:'var(--adm-text3)'}}>{sub}</p>
    </div>
  );

  // ── Animated table body ───────────────────────────
  const AnimRows = ({rows, cols, empty}:{rows:any[], cols:number, empty:string}) => {
    if(rows.length===0) return <tr><td colSpan={cols} className="text-center py-10 italic text-[0.78rem]" style={{color:'var(--adm-text3)'}}>{empty}</td></tr>;
    return <>{rows.map((row,i)=>row._render(i))}</>;
  };

  return (
    <div className="adm-shell flex h-screen overflow-hidden">

      {/* Desktop sidebar */}
      <motion.aside
        animate={{width: sidebarOpen ? 224 : 56}}
        transition={{duration:0.28, ease:EASE}}
        className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
      >
        <Sidebar />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
              onClick={()=>setMobileOpen(false)} className="fixed inset-0 z-40 md:hidden"
              style={{background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)'}}
            />
            <motion.aside initial={{x:-224}} animate={{x:0}} exit={{x:-224}} transition={{type:'spring',stiffness:320,damping:32}}
              className="fixed left-0 top-0 bottom-0 w-56 z-50 md:hidden flex flex-col overflow-hidden">
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="adm-header flex-shrink-0 flex items-center justify-between px-4 gap-3" style={{height:'3.25rem'}}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
                  setSidebarOpen((v) => !v);
                } else {
                  setMobileOpen((v) => !v);
                }
              }}
              className="adm-icon-btn"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-[0.7rem]">
              <span style={{color:'var(--adm-text3)'}}>Admin</span>
              <ChevronRight className="w-3 h-3" style={{color:'var(--adm-text3)'}}/>
              <AnimatePresence mode="wait">
                <motion.span key={section} initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}} transition={{duration:0.18}}
                  className="font-semibold" style={{color:'var(--adm-text)'}}>
                  {TITLES[section]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(pendingMod>0||pendingIq>0) && (
              <button
                onClick={()=>go('moderation')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.7rem] font-medium"
                style={{background:'var(--adm-card2)',color:'var(--adm-text2)',border:'1px solid var(--adm-border)'}}>
                <Bell className="w-3.5 h-3.5"/>
                {pendingMod+pendingIq} pending
              </button>
            )}
            <button onClick={toggleTheme} className="adm-icon-btn" aria-label="Toggle theme">
              {theme==='light' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{background:'var(--adm-bg2)'}}>
          <div className="p-5 max-w-screen-xl mx-auto">
          <AnimatePresence mode="wait" initial={false}>

          {/* ── DASHBOARD ── */}
          {section==='dashboard' && (
            <motion.div key="dashboard" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <SectionHead title="Dashboard"
                sub={new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {label:'Products',          value:products.length,              sub:`${products.filter(p=>p.is_featured).length} featured`},
                  {label:'Page views',        value:totalViews,                   sub:'Recent events'},
                  {label:'WhatsApp clicks',   value:totalClicks,                  sub:`${cvr}% conversion`},
                  {label:'Pending',           value:pendingMod+pendingIq,         sub:`${reviews.length} reviews · ${comments.length} comments`},
                ].map(k=>(
                  <div key={k.label} className="adm-card p-4">
                    <p className="text-[0.68rem] font-medium uppercase tracking-wide mb-2" style={{color:'var(--adm-text3)'}}>{k.label}</p>
                    <p className="text-2xl font-semibold mb-1" style={{color:'var(--adm-text)'}}>{k.value}</p>
                    <p className="text-[0.7rem]" style={{color:'var(--adm-text3)'}}>{k.sub}</p>
                  </div>
                ))}
              </div>
              {/* Quick actions */}
              <div className="adm-card p-4">
                <p className="text-[0.68rem] font-medium uppercase tracking-wide mb-3" style={{color:'var(--adm-text3)'}}>Quick actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {label:'Add product',   icon:Package,       action:()=>{go('inventory');setTimeout(()=>openProd(null),60);}},
                    {label:'New post',      icon:BookOpen,       action:()=>{go('blog');setTimeout(()=>openBlog(null),60);}},
                    {label:'Inquiries',     icon:MessageSquare, action:()=>go('inquiries')},
                    {label:'Moderation',    icon:ListOrdered,   action:()=>go('moderation')},
                  ].map(q=>{const Icon=q.icon; return (
                    <button key={q.label} onClick={q.action}
                      className="flex items-center gap-2.5 p-3 rounded-md text-left transition-colors hover:opacity-90"
                      style={{background:'var(--adm-card2)',border:'1px solid var(--adm-border2)'}}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{color:'var(--adm-text3)'}}/>
                      <span className="text-[0.78rem] font-medium" style={{color:'var(--adm-text)'}}>{q.label}</span>
                    </button>
                  );})}
                </div>
              </div>
              {/* Recent split */}
              <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={GRID} initial="hidden" animate="visible">
                {/* Recent products */}
                <motion.div variants={CARD} className="adm-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                    <p className="text-[0.72rem] font-bold" style={{color:'var(--adm-text)'}}>Recent Products</p>
                    <button onClick={()=>go('inventory')} className="text-[0.65rem] font-semibold hover:underline" style={{color:'var(--adm-text2)'}}>View all →</button>
                  </div>
                  {products.length===0
                    ? <p className="px-4 py-6 text-center text-[0.75rem] italic" style={{color:'var(--adm-text3)'}}>No products yet.</p>
                    : products.slice(0,5).map((p,i)=>{
                        const img=(p.product_images||[]).sort((a:any,b:any)=>(a.display_order??0)-(b.display_order??0))[0]?.image_url;
                        return (
                          <motion.div key={p.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05,duration:0.22}}
                            className="flex items-center gap-3 px-4 py-2.5" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                            {img&&<img src={img} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{border:'1px solid var(--adm-border)'}}/>}
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.75rem] font-semibold truncate" style={{color:'var(--adm-text)'}}>{p.name}</p>
                              <p className="text-[0.62rem]" style={{color:'var(--adm-text3)'}}>₹{p.price?.toLocaleString()}</p>
                            </div>
                            {p.is_featured&&<span className="adm-badge-gold">Featured</span>}
                          </motion.div>
                        );
                      })
                  }
                </motion.div>
                {/* Recent inquiries */}
                <motion.div variants={CARD} className="adm-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                    <p className="text-[0.72rem] font-bold" style={{color:'var(--adm-text)'}}>Recent Inquiries</p>
                    <button onClick={()=>go('inquiries')} className="text-[0.65rem] font-semibold hover:underline" style={{color:'var(--adm-text2)'}}>View all →</button>
                  </div>
                  {inquiries.length===0
                    ? <p className="px-4 py-6 text-center text-[0.75rem] italic" style={{color:'var(--adm-text3)'}}>No inquiries yet.</p>
                    : inquiries.slice(0,5).map((inq,i)=>(
                        <motion.div key={inq.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05,duration:0.22}}
                          className="flex items-center gap-3 px-4 py-2.5" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[0.65rem] font-bold" style={{background:'rgba(63,63,70,0.12)',color:'var(--adm-text2)'}}>
                            {inq.name?.[0]?.toUpperCase()||'?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.75rem] font-semibold truncate" style={{color:'var(--adm-text)'}}>{inq.name}</p>
                            <p className="text-[0.62rem] truncate" style={{color:'var(--adm-text3)'}}>{inq.message?.slice(0,45)}…</p>
                          </div>
                          <span className={inq.status==='pending'?'adm-badge-amber':inq.status==='replied'?'adm-badge-green':'adm-badge-muted'}>{inq.status}</span>
                        </motion.div>
                      ))
                  }
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {section==='analytics' && (
            <motion.div key="analytics" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <SectionHead title="Analytics" sub="Traffic and conversion data from the last 14 days." />
              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3" variants={GRID} initial="hidden" animate="visible">
                {[
                  {label:'Page Views',      value:totalViews,     sub:'page_view + product_click',  color:'#6ea8cc'},
                  {label:'WhatsApp Clicks', value:totalClicks,    sub:'checkout intent events',      color:'#5cad8a'},
                  {label:'Conversion Rate', value:`${cvr}%`,      sub:'visitors → WA click',         color:'var(--adm-text2)'},
                ].map(m=>(
                  <motion.div key={m.label} variants={CARD} whileHover={{y:-2}} className="adm-card p-4">
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest mb-2" style={{color:'var(--adm-text3)'}}>{m.label}</p>
                    <p className="text-3xl font-bold mb-1" style={{color:m.color}}>{m.value}</p>
                    <p className="text-[0.65rem]" style={{color:'var(--adm-text3)'}}>{m.sub}</p>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card p-5">
                <AnalyticsCharts trafficData={traffic} deviceData={devData} topSearches={topSearches} />
              </motion.div>
            </motion.div>
          )}

          {/* ── INVENTORY ── */}
          {section==='inventory' && (
            <motion.div key="inventory" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <SectionHead title="Products" sub={`${products.length} products · ${products.filter(p=>p.is_featured).length} featured`} />
                <button onClick={()=>openProd(null)} className="adm-btn-primary">
                  <PlusCircle className="w-3.5 h-3.5"/> Add product
                </button>
              </div>
              <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full adm-table">
                    <thead><tr>{['Artwork','SKU','Category','Price','Flags','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {products.length===0
                        ? <tr><td colSpan={6} className="text-center py-10 italic text-[0.78rem]" style={{color:'var(--adm-text3)'}}>No products yet.</td></tr>
                        : products.map((prod,i)=>{
                          const img=(prod.product_images||[]).sort((a:any,b:any)=>(a.display_order??0)-(b.display_order??0))[0]?.image_url;
                          return (
                            <motion.tr key={prod.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04,duration:0.22,ease:EASE}}>
                              <td><div className="flex items-center gap-3">
                                {img&&<img src={img} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" style={{border:'1px solid var(--adm-border)'}}/>}
                                <div className="min-w-0"><p className="font-semibold truncate max-w-[160px]" style={{color:'var(--adm-text)'}}>{prod.name}</p><p className="text-[0.62rem]" style={{color:'var(--adm-text3)'}}>/{prod.slug}</p></div>
                              </div></td>
                              <td className="font-mono text-[0.7rem]" style={{color:'var(--adm-text3)'}}>{prod.sku||'—'}</td>
                              <td className="font-semibold" style={{color:'var(--adm-text2)'}}>{prod.category?.name||'—'}</td>
                              <td className="font-bold" style={{color:'var(--adm-text2)'}}>₹{prod.price?.toLocaleString()}</td>
                              <td><div className="flex flex-wrap gap-1">
                                {prod.is_featured&&<span className="adm-badge-gold">Featured</span>}
                                {prod.is_best_seller&&<span className="adm-badge-gold">Bestseller</span>}
                                {prod.is_trending&&<span className="adm-badge-green">Trending</span>}
                                {prod.is_customizable&&<span className="adm-badge-muted">Custom</span>}
                              </div></td>
                              <td><div className="flex items-center gap-1">
                                <button onClick={()=>featToggle(prod.id,prod.is_featured)} className="adm-icon-btn" title={prod.is_featured?'Unfeature':'Feature'}>
                                  <Star className={`w-3.5 h-3.5 ${prod.is_featured?'fill-current':''}`} style={{color:prod.is_featured?'var(--adm-text)':undefined}}/>
                                </button>
                                <button onClick={()=>openProd(prod)} className="adm-icon-btn" title="Edit"><Edit className="w-3.5 h-3.5"/></button>
                                <button onClick={()=>setDelConf({type:'product',id:prod.id})} className="adm-icon-btn danger" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>
                              </div></td>
                            </motion.tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── INQUIRIES ── */}
          {section==='inquiries' && (()=>{
            const filtered=inquiries.filter(i=>iqFilter==='all'||i.status===iqFilter);
            return (
              <motion.div key="inquiries" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <SectionHead title="Inquiries" sub={`${pendingIq} pending · ${inquiries.length} total`} />
                  <div className="flex gap-1 p-1 rounded-lg" style={{background:'var(--adm-card)',border:'1px solid var(--adm-border)'}}>
                    {(['all','pending','replied','closed'] as const).map(f=>(
                      <motion.button key={f} onClick={()=>setIqFilter(f)} whileTap={{scale:0.95}}
                        className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wide transition-all capitalize"
                        style={{background:iqFilter===f?'#18181b':'transparent',color:iqFilter===f?'#fafafa':'var(--adm-text3)'}}>
                        {f}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full adm-table">
                      <thead><tr>{['Customer','Product','Message','Type','Date','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {filtered.length===0
                          ? <tr><td colSpan={7} className="text-center py-10 italic text-[0.78rem]" style={{color:'var(--adm-text3)'}}>No inquiries match this filter.</td></tr>
                          : filtered.map((inq,i)=>(
                            <motion.tr key={inq.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04,duration:0.22,ease:EASE}}>
                              <td><p className="font-semibold" style={{color:'var(--adm-text)'}}>{inq.name}</p><p className="text-[0.62rem]" style={{color:'var(--adm-text3)'}}>{inq.email||inq.phone||'—'}</p></td>
                              <td>{inq.product?<Link href={`/product/${inq.product.slug}`} target="_blank" className="truncate max-w-[110px] block hover:underline" style={{color:'var(--adm-text2)'}}>{inq.product.name}</Link>:<span className="italic" style={{color:'var(--adm-text3)'}}>General</span>}</td>
                              <td className="max-w-[180px]"><p className="line-clamp-2 leading-relaxed" style={{color:'var(--adm-text3)'}}>{inq.message}</p></td>
                              <td><span className="adm-badge-muted">{inq.type||'form'}</span></td>
                              <td className="whitespace-nowrap" style={{color:'var(--adm-text3)'}}>{new Date(inq.created_at).toLocaleDateString('en-IN')}</td>
                              <td><span className={inq.status==='pending'?'adm-badge-amber':inq.status==='replied'?'adm-badge-green':'adm-badge-muted'}>{inq.status}</span></td>
                              <td><div className="flex items-center gap-1">
                                {inq.status==='pending'&&<button onClick={()=>iqStatus(inq.id,'replied')} className="adm-icon-btn" title="Mark replied" style={{color:'#5cad8a'}}><Check className="w-3.5 h-3.5"/></button>}
                                {inq.status!=='closed'&&<button onClick={()=>iqStatus(inq.id,'closed')} className="adm-icon-btn" title="Close"><CheckSquare className="w-3.5 h-3.5"/></button>}
                              </div></td>
                            </motion.tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}

          {/* ── MODERATION ── */}
          {section==='moderation' && (
            <motion.div key="moderation" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <SectionHead title="Moderation" sub={`${reviews.length} reviews · ${comments.length} comments awaiting approval${approvedReviews.length>0?` · ${approvedReviews.length} live`:''}`} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Reviews */}
                <div className="space-y-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'var(--adm-text3)'}}>
                    <Star className="w-3.5 h-3.5" style={{color:'var(--adm-text2)'}}/>Pending Reviews ({reviews.length})
                  </p>
                  <AnimatePresence>
                  {reviews.length===0
                    ? <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card p-6 text-center text-[0.75rem] italic" style={{color:'var(--adm-text3)'}}>All reviews up to date.</motion.div>
                    : reviews.map((rev,i)=>(
                      <motion.div key={rev.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20,height:0,marginBottom:0,paddingBottom:0}} transition={{delay:i*0.06,duration:0.24,ease:EASE}} className="adm-card p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-0.5" style={{color:'var(--adm-text3)'}}>{rev.product?.name}</p>
                            <p className="text-[0.82rem] font-semibold" style={{color:'var(--adm-text)'}}>{rev.title||'Client Review'}</p>
                            <p className="text-[0.65rem]" style={{color:'var(--adm-text3)'}}>By {rev.user_name} · {new Date(rev.created_at).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">{Array.from({length:5}).map((_,j)=><Star key={j} className="w-3 h-3" style={{color:j<rev.rating?'#f0a830':'var(--adm-border)',fill:j<rev.rating?'#f0a830':'transparent'}}/>)}</div>
                        </div>
                        <p className="text-[0.75rem] leading-relaxed p-3 rounded-lg" style={{background:'var(--adm-card2)',color:'var(--adm-text2)'}}>{rev.comment}</p>
                        <div className="flex justify-end gap-2 pt-1">
                          <button onClick={()=>modReview(rev.id,'reject')} className="adm-btn-ghost" style={{color:'#e05252',borderColor:'rgba(220,80,80,0.22)'}}>Reject</button>
                          <button onClick={()=>modReview(rev.id,'approve')} className="adm-btn-primary" style={{background:'#3da87a'}}><Check className="w-3 h-3"/>Approve</button>
                        </div>
                      </motion.div>
                    ))
                  }
                  </AnimatePresence>
                  {approvedReviews.length>0&&(
                    <div className="mt-3">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest mb-2" style={{color:'var(--adm-text3)'}}>Live Reviews ({approvedReviews.length})</p>
                      <div className="adm-card overflow-hidden">
                        {approvedReviews.slice(0,8).map((rev,i)=>(
                          <div key={rev.id} className="flex items-center gap-3 px-4 py-2.5" style={{borderBottom:i<Math.min(approvedReviews.length,8)-1?'1px solid var(--adm-border2)':'none'}}>
                            <div className="flex-1 min-w-0"><p className="text-[0.72rem] font-semibold truncate" style={{color:'var(--adm-text)'}}>{rev.product?.name}</p><p className="text-[0.62rem]" style={{color:'var(--adm-text3)'}}>{rev.user_name} · {'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</p></div>
                            <button onClick={()=>setDelConf({type:'review',id:rev.id})} className="adm-icon-btn danger flex-shrink-0" title="Remove"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Comments */}
                <div className="space-y-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest flex items-center gap-2" style={{color:'var(--adm-text3)'}}>
                    <MessageCircle className="w-3.5 h-3.5" style={{color:'var(--adm-text2)'}}/>Pending Comments ({comments.length})
                  </p>
                  <AnimatePresence>
                  {comments.length===0
                    ? <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card p-6 text-center text-[0.75rem] italic" style={{color:'var(--adm-text3)'}}>All comments up to date.</motion.div>
                    : comments.map((cmt,i)=>(
                      <motion.div key={cmt.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:20,height:0,marginBottom:0}} transition={{delay:i*0.06,duration:0.24,ease:EASE}} className="adm-card p-4 space-y-3">
                        <div>
                          <p className="text-[0.6rem] font-bold uppercase tracking-wider mb-0.5" style={{color:'var(--adm-text3)'}}>{cmt.product?.name}</p>
                          <p className="text-[0.65rem]" style={{color:'var(--adm-text3)'}}>{cmt.user_name} · {new Date(cmt.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <p className="text-[0.78rem] leading-relaxed p-3 rounded-lg" style={{background:'var(--adm-card2)',color:'var(--adm-text2)'}}>{cmt.comment}</p>
                        {replyId===cmt.id
                          ? <form onSubmit={e=>modReply(e,cmt)} className="space-y-2">
                              <label className={LBL} style={{color:'var(--adm-text2)'}}>Reply</label>
                              <textarea required value={replyTxt} onChange={e=>setReplyTxt(e.target.value)} rows={3} placeholder="Write your official reply…" className={`${INP} resize-none`}/>
                              <div className="flex justify-end gap-2">
                                <button type="button" className="adm-btn-ghost" onClick={()=>{setReplyId(null);setReplyTxt('');}}>Cancel</button>
                                <button type="submit" disabled={loading} className="adm-btn-primary" style={{opacity:loading?0.6:1}}>Post & Approve</button>
                              </div>
                            </form>
                          : <div className="flex justify-end gap-2 pt-1">
                              <button onClick={()=>modComment(cmt.id,'reject')} className="adm-btn-ghost" style={{color:'#e05252',borderColor:'rgba(220,80,80,0.22)'}}>Reject</button>
                              <button onClick={()=>setReplyId(cmt.id)} className="adm-btn-ghost">Reply</button>
                              <button onClick={()=>modComment(cmt.id,'approve')} className="adm-btn-primary" style={{background:'#3da87a'}}><Check className="w-3 h-3"/>Approve</button>
                            </div>
                        }
                      </motion.div>
                    ))
                  }
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BLOG ── */}
          {section==='blog' && (
            <motion.div key="blog" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <SectionHead title="Blog" sub={`${blogPosts.filter(b=>b.is_published).length} published · ${blogPosts.filter(b=>!b.is_published).length} drafts`} />
                <motion.button whileHover={{y:-1}} whileTap={{scale:0.97}} onClick={()=>openBlog(null)} className="adm-btn-primary">
                  <PlusCircle className="w-3.5 h-3.5"/>New Article
                </motion.button>
              </div>
              <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full adm-table">
                    <thead><tr>{['Post','Category','Read time','Tags','Date','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {blogPosts.length===0
                        ? <tr><td colSpan={7} className="text-center py-10 italic text-[0.78rem]" style={{color:'var(--adm-text3)'}}>No posts yet.</td></tr>
                        : blogPosts.map((post,i)=>(
                          <motion.tr key={post.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04,duration:0.22}}>
                            <td><div className="flex items-center gap-3">
                              {post.featured_image&&<img src={post.featured_image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" style={{border:'1px solid var(--adm-border)'}}/>}
                              <div className="min-w-0"><p className="font-semibold truncate max-w-[180px]" style={{color:'var(--adm-text)'}}>{post.title}</p><p className="text-[0.62rem]" style={{color:'var(--adm-text3)'}}>/{post.slug}</p></div>
                            </div></td>
                            <td style={{color:'var(--adm-text2)'}}>{post.category?.name||'—'}</td>
                            <td style={{color:'var(--adm-text3)'}}>{post.reading_time||5} min</td>
                            <td className="max-w-[120px] truncate" style={{color:'var(--adm-text3)'}}>{post.tags?.join(', ')||'—'}</td>
                            <td className="whitespace-nowrap" style={{color:'var(--adm-text3)'}}>{new Date(post.created_at).toLocaleDateString('en-IN')}</td>
                            <td><span className={post.is_published?'adm-badge-green':'adm-badge-muted'}>{post.is_published?'Live':'Draft'}</span></td>
                            <td><div className="flex items-center gap-1">
                              <Link href={`/blog/${post.slug}`} target="_blank" className="adm-icon-btn" title="Preview"><ExternalLink className="w-3.5 h-3.5"/></Link>
                              <button onClick={()=>openBlog(post)} className="adm-icon-btn" title="Edit"><Edit className="w-3.5 h-3.5"/></button>
                              <button onClick={()=>setDelConf({type:'blog',id:post.id})} className="adm-icon-btn danger" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div></td>
                          </motion.tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── USERS ── */}
          {section==='users' && (
            <motion.div key="users" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <SectionHead title="User Management" sub={`${profiles.length} profiles · ${profiles.filter(p=>p.role==='admin').length} admins`} />
                <div className="relative">
                  <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search name, email, ID…" className={`${INP} w-64 pl-8`} />
                  <Users className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{color:'var(--adm-text3)'}} />
                </div>
              </div>
              <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full adm-table">
                    <thead><tr>{['User','Email','Role','Registered','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(() => {
                        const q = userSearch.toLowerCase();
                        const filtered = profiles.filter(p =>
                          !q ||
                          (p.full_name||'').toLowerCase().includes(q) ||
                          (p.email||'').toLowerCase().includes(q) ||
                          p.id.toLowerCase().includes(q)
                        );
                        if(filtered.length===0) return <tr><td colSpan={5} className="text-center py-10 italic text-[0.78rem]" style={{color:'var(--adm-text3)'}}>No profiles found.</td></tr>;
                        return filtered.map((p,i)=>(
                          <motion.tr key={p.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.03,duration:0.22}}
                            className="cursor-pointer" onClick={()=>{ setSelectedUser(p); setUserInquiries([]); setUserPanelLoading(true);
                              import('@/lib/supabase/client').then(({supabase})=>{
                                supabase.from('inquiries').select('id,name,message,type,status,created_at,product:products(name)').eq('user_id',p.id).order('created_at',{ascending:false}).limit(20).then(({data})=>{ setUserInquiries(data||[]); setUserPanelLoading(false); });
                              });
                            }}>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[0.65rem] font-bold"
                                  style={{background:'rgba(63,63,70,0.12)',color:'var(--adm-text2)'}}>
                                  {(p.full_name?.[0]||p.email?.[0]||'?').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[0.76rem] font-semibold truncate" style={{color:'var(--adm-text)'}}>{p.full_name||<span className="italic" style={{color:'var(--adm-text3)'}}>No name</span>}</p>
                                  <p className="font-mono text-[0.58rem] truncate max-w-[160px]" style={{color:'var(--adm-text3)'}}>{p.id.slice(0,16)}…</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-[0.72rem]" style={{color:'var(--adm-text2)'}}>{p.email||'—'}</td>
                            <td><span className={p.role==='admin'?'adm-badge-gold':'adm-badge-muted'}>{p.role||'user'}</span></td>
                            <td className="whitespace-nowrap" style={{color:'var(--adm-text3)'}}>{p.created_at?new Date(p.created_at).toLocaleDateString('en-IN'):'—'}</td>
                            <td onClick={e=>e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                <LuxSelect admin value={p.role||'user'} onChange={v=>roleChange(p.id,v as 'user'|'admin')} options={[{value:'user',label:'User'},{value:'admin',label:'Admin'}]} placement={'bottom-right'} panelClassName={'min-w-[120px]'} />
                                <button onClick={()=>{ setSelectedUser(p); setUserInquiries([]); setUserPanelLoading(true);
                                  import('@/lib/supabase/client').then(({supabase})=>{
                                    supabase.from('inquiries').select('id,name,message,type,status,created_at,product:products(name)').eq('user_id',p.id).order('created_at',{ascending:false}).limit(20).then(({data})=>{ setUserInquiries(data||[]); setUserPanelLoading(false); });
                                  });
                                }} className="adm-icon-btn" title="Manage user"><ChevronRight className="w-3.5 h-3.5"/></button>
                              </div>
                            </td>
                          </motion.tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* ── User Detail Slide-out Panel ── */}
              <AnimatePresence>
              {selectedUser && (
                <>
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelectedUser(null)}
                    className="fixed inset-0 z-50" style={{background:'rgba(0,0,0,0.45)',backdropFilter:'blur(4px)'}} />
                  <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:320,damping:34}}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col overflow-hidden"
                    style={{background:'var(--adm-modal-bg)',borderLeft:'1px solid var(--adm-border)'}}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{borderBottom:'1px solid var(--adm-border)'}}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{background:'rgba(63,63,70,0.14)',color:'var(--adm-text2)'}}>
                          {(selectedUser.full_name?.[0]||selectedUser.email?.[0]||'?').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-semibold" style={{color:'var(--adm-text)'}}>{selectedUser.full_name||'No name'}</p>
                          <p className="text-[0.65rem]" style={{color:'var(--adm-text3)'}}>{selectedUser.email||'—'}</p>
                        </div>
                      </div>
                      <button onClick={()=>setSelectedUser(null)} className="adm-icon-btn"><X className="w-4 h-4"/></button>
                    </div>
                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      {/* Info cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {label:'Role', value:<span className={selectedUser.role==='admin'?'adm-badge-gold':'adm-badge-muted'}>{selectedUser.role||'user'}</span>},
                          {label:'Joined', value:selectedUser.created_at?new Date(selectedUser.created_at).toLocaleDateString('en-IN'):'—'},
                          {label:'Last Active', value:selectedUser.updated_at?new Date(selectedUser.updated_at).toLocaleDateString('en-IN'):'—'},
                          {label:'User ID', value:<span className="font-mono text-[0.6rem]" style={{color:'var(--adm-text3)'}}>{selectedUser.id.slice(0,18)}…</span>},
                        ].map(({label,value})=>(
                          <div key={label} className="adm-card2 p-3 rounded-lg">
                            <p className="text-[0.58rem] font-bold uppercase tracking-widest mb-1" style={{color:'var(--adm-text3)'}}>{label}</p>
                            <div className="text-[0.76rem] font-semibold" style={{color:'var(--adm-text)'}}>{value}</div>
                          </div>
                        ))}
                      </div>
                      {/* Copy full ID */}
                      <div className="adm-card2 rounded-lg p-3 flex items-center justify-between gap-3">
                        <p className="font-mono text-[0.62rem] truncate flex-1" style={{color:'var(--adm-text3)'}}>{selectedUser.id}</p>
                        <button onClick={()=>{ navigator.clipboard.writeText(selectedUser.id); addToast('User ID copied.','success'); }} className="adm-icon-btn flex-shrink-0" title="Copy ID">
                          <Copy className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                      {/* Inquiries */}
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{color:'var(--adm-text3)'}}>
                          <MessageSquare className="w-3.5 h-3.5" style={{color:'var(--adm-text2)'}}/>
                          Inquiries ({userInquiries.length})
                        </p>
                        {userPanelLoading ? (
                          <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 rounded-lg animate-pulse" style={{background:'var(--adm-card2)'}}/>)}</div>
                        ) : userInquiries.length===0 ? (
                          <div className="adm-card2 rounded-lg p-5 text-center text-[0.75rem] italic" style={{color:'var(--adm-text3)'}}>No inquiries from this user.</div>
                        ) : (
                          <div className="space-y-2">
                            {userInquiries.map(inq=>(
                              <div key={inq.id} className="adm-card2 rounded-lg p-3">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-[0.65rem] font-bold" style={{color:'var(--adm-text)'}}>{inq.product?.name||'General inquiry'}</span>
                                  <span className={inq.status==='pending'?'adm-badge-amber':inq.status==='replied'?'adm-badge-green':'adm-badge-muted'}>{inq.status}</span>
                                </div>
                                <p className="text-[0.7rem] leading-relaxed line-clamp-2" style={{color:'var(--adm-text3)'}}>{inq.message}</p>
                                <p className="text-[0.58rem] mt-1" style={{color:'var(--adm-text3)'}}>{new Date(inq.created_at).toLocaleDateString('en-IN')}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Footer actions */}
                    <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{borderTop:'1px solid var(--adm-border)'}}>
                      <LuxSelect admin value={selectedUser.role||'user'} onChange={v=>{ roleChange(selectedUser.id,v as 'user'|'admin'); setSelectedUser({...selectedUser,role:v}); }}
                        options={[{value:'user',label:'User'},{value:'admin',label:'Admin'}]} label="Role:" placement={'bottom-left'} panelClassName={'min-w-[120px]'} />
                      <button onClick={()=>setSelectedUser(null)} className="adm-btn-ghost ml-auto">Close</button>
                    </div>
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── VOUCHERS ── */}
          {section==='vouchers' && (
            <motion.div key="vouchers" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <SectionHead title="Vouchers" sub={`${vouchers.length} total · ${vouchers.filter(v=>v.is_active).length} active`} />
                <motion.button whileHover={{y:-1}} whileTap={{scale:0.97}} onClick={()=>{ setEditVoucher(null); setVCode(''); setVDesc(''); setVType('percentage'); setVValue(10); setVMin(0); setVMax(0); setVMaxUses(0); setVExpiry(''); setVActive(true); setShowVoucher(true); }} className="adm-btn-primary">
                  <PlusCircle className="w-3.5 h-3.5"/> New Voucher
                </motion.button>
              </div>
              {/* Search */}
              <div className="relative w-64">
                <input value={voucherSearch} onChange={e=>setVoucherSearch(e.target.value)} placeholder="Search code or description…" className={`${INP} pl-8`} />
                <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{color:'var(--adm-text3)'}} />
              </div>
              <motion.div variants={FADE} initial="hidden" animate="visible" className="adm-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full adm-table">
                    <thead><tr>{['Code','Type','Value','Min Order','Uses','Expiry','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(()=>{
                        const q=voucherSearch.toLowerCase();
                        const filtered=vouchers.filter(v=>!q||(v.code||'').toLowerCase().includes(q)||(v.description||'').toLowerCase().includes(q));
                        if(filtered.length===0) return <tr><td colSpan={8} className="text-center py-10 italic text-[0.78rem]" style={{color:'var(--adm-text3)'}}>No vouchers yet.</td></tr>;
                        return filtered.map((v,i)=>(
                          <motion.tr key={v.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.04,duration:0.22}}>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[0.78rem]" style={{color:'var(--adm-text2)'}}>{v.code}</span>
                                <button onClick={()=>{ navigator.clipboard.writeText(v.code); addToast('Code copied.','success'); }} className="adm-icon-btn" style={{width:'1.4rem',height:'1.4rem'}} title="Copy">
                                  <Copy className="w-3 h-3"/>
                                </button>
                              </div>
                              {v.description && <p className="text-[0.62rem] mt-0.5 truncate max-w-[140px]" style={{color:'var(--adm-text3)'}}>{v.description}</p>}
                            </td>
                            <td><span className="adm-badge-muted capitalize">{v.discount_type?.replace('_',' ')}</span></td>
                            <td className="font-bold" style={{color:'var(--adm-text)'}}>
                              {v.discount_type==='percentage'?`${v.discount_value}%`:`₹${v.discount_value}`}
                            </td>
                            <td style={{color:'var(--adm-text3)'}}>{v.min_order_value?`₹${v.min_order_value}`:'—'}</td>
                            <td style={{color:'var(--adm-text3)'}}>{v.used_count}{v.max_global_uses?`/${v.max_global_uses}`:''}</td>
                            <td className="whitespace-nowrap" style={{color:'var(--adm-text3)'}}>{v.expiry_date?new Date(v.expiry_date).toLocaleDateString('en-IN'):'No expiry'}</td>
                            <td><span className={v.is_active?'adm-badge-green':'adm-badge-muted'}>{v.is_active?'Active':'Inactive'}</span></td>
                            <td>
                              <div className="flex items-center gap-1">
                                <button onClick={async()=>{
                                  try{ const {supabase}=await import('@/lib/supabase/client');
                                    await supabase.from('vouchers').update({is_active:!v.is_active}).eq('id',v.id);
                                    setVouchers(vouchers.map(x=>x.id===v.id?{...x,is_active:!v.is_active}:x));
                                    addToast(v.is_active?'Voucher deactivated.':'Voucher activated.','success');
                                  }catch(e:any){ addToast(e.message,'error'); }
                                }} className="adm-icon-btn" title={v.is_active?'Deactivate':'Activate'}>
                                  {v.is_active?<ShieldOff className="w-3.5 h-3.5"/>:<Shield className="w-3.5 h-3.5"/>}
                                </button>
                                <button onClick={()=>{ setEditVoucher(v); setVCode(v.code); setVDesc(v.description||''); setVType(v.discount_type||'percentage'); setVValue(v.discount_value||0); setVMin(v.min_order_value||0); setVMax(v.max_discount||0); setVMaxUses(v.max_global_uses||0); setVExpiry(v.expiry_date?v.expiry_date.slice(0,10):''); setVActive(v.is_active); setShowVoucher(true); }} className="adm-icon-btn" title="Edit">
                                  <Edit className="w-3.5 h-3.5"/>
                                </button>
                                <button onClick={async()=>{
                                  if(!confirm('Delete this voucher?')) return;
                                  try{ const {supabase}=await import('@/lib/supabase/client');
                                    await supabase.from('vouchers').delete().eq('id',v.id);
                                    setVouchers(vouchers.filter(x=>x.id!==v.id)); addToast('Deleted.','success');
                                  }catch(e:any){ addToast(e.message,'error'); }
                                }} className="adm-icon-btn danger" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── SETTINGS ── */}
          {section==='settings' && (
            <motion.div key="settings" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <SectionHead title="Site Settings" sub="Configuration reference and panel overview." />
              <div className="flex gap-1 p-1 rounded-lg w-fit" style={{background:'var(--adm-card)',border:'1px solid var(--adm-border)'}}>
                {(['general','seo','notifications'] as const).map(t=>(
                  <motion.button key={t} onClick={()=>setSettTab(t)} whileTap={{scale:0.96}}
                    className="px-4 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-wide transition-all capitalize"
                    style={{background:settTab===t?'#18181b':'transparent',color:settTab===t?'#fafafa':'var(--adm-text3)'}}>
                    {t}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence mode="wait">
              {settTab==='general' && (
                <motion.div key="gen" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="adm-card p-5 space-y-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest" style={{color:'var(--adm-text3)'}}>Business Information</p>
                    <p className="text-[0.72rem] leading-relaxed p-3 rounded-lg" style={{background:'var(--adm-card2)',color:'var(--adm-text3)',border:'1px solid var(--adm-border2)'}}>
                      These are read-only references. Edit <code style={{color:'var(--adm-text2)'}}>.env.local</code> to update values.
                    </p>
                    {[
                      {label:'Gallery Name',  value:'Chandan Art Gallery'},
                      {label:'Contact Email', value:adminEmail},
                      {label:'Site URL',      value:typeof window!=='undefined'?window.location.origin:'—'},
                      {label:'Timezone',      value:'Asia/Kolkata (IST)'},
                      {label:'Currency',      value:'INR (₹)'},
                    ].map((f,i)=>(
                      <motion.div key={f.label} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                        className="flex items-center justify-between py-2" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                        <span className="text-[0.72rem] font-semibold" style={{color:'var(--adm-text2)'}}>{f.label}</span>
                        <span className="text-[0.72rem] font-mono" style={{color:'var(--adm-text3)'}}>{f.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="adm-card p-5 space-y-1">
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest mb-3" style={{color:'var(--adm-text3)'}}>Site Navigation</p>
                    {[{label:'Shop',href:'/shop'},{label:'Blog',href:'/blog'},{label:'About',href:'/about'},{label:'Contact',href:'/contact'},{label:'FAQ',href:'/faq'},{label:'Profile',href:'/profile'},{label:'Privacy Policy',href:'/privacy'},{label:'Terms',href:'/terms'},{label:'Returns',href:'/returns'}].map((lnk,i)=>(
                      <motion.div key={lnk.href} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}>
                        <Link href={lnk.href} target="_blank" className="flex items-center justify-between py-2 text-[0.75rem] transition-colors" style={{borderBottom:'1px solid var(--adm-border2)',color:'var(--adm-text2)'}}>
                          <span>{lnk.label}</span>
                          <span className="flex items-center gap-1.5" style={{color:'var(--adm-text3)'}}>
                            <span className="font-mono text-[0.65rem]">{lnk.href}</span>
                            <ExternalLink className="w-3 h-3"/>
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              {settTab==='seo' && (
                <motion.div key="seo" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="adm-card p-5 max-w-2xl space-y-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest" style={{color:'var(--adm-text3)'}}>SEO Configuration</p>
                  <p className="text-[0.72rem] leading-relaxed p-3 rounded-lg" style={{background:'var(--adm-card2)',color:'var(--adm-text3)',border:'1px solid var(--adm-border2)'}}>
                    Metadata is managed in <code style={{color:'var(--adm-text2)'}}>app/layout.tsx</code>. Per-product and per-post SEO is set in their forms above.
                  </p>
                  {[
                    {label:'Meta Title',       value:'Chandan Art Gallery | Luxury Custom Framing & Indian Wall Decor'},
                    {label:'Meta Description', value:'Handcrafted wood photo frames, acrylic stands, canvas prints…'},
                    {label:'Robots',           value:'index, follow'},
                    {label:'Sitemap',          value:'/sitemap.xml (auto-generated)'},
                    {label:'Robots.txt',       value:'/robots.txt (auto-generated)'},
                  ].map((f,i)=>(
                    <motion.div key={f.label} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      className="flex items-start justify-between gap-4 py-2" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                      <span className="text-[0.72rem] font-semibold flex-shrink-0" style={{color:'var(--adm-text2)'}}>{f.label}</span>
                      <span className="text-[0.7rem] text-right" style={{color:'var(--adm-text3)'}}>{f.value}</span>
                    </motion.div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Link href="/sitemap.xml" target="_blank" className="adm-btn-ghost text-[0.68rem]">View Sitemap</Link>
                    <Link href="/robots.txt"  target="_blank" className="adm-btn-ghost text-[0.68rem]">View Robots.txt</Link>
                  </div>
                </motion.div>
              )}
              {settTab==='notifications' && (
                <motion.div key="notif" variants={PAGE} initial="hidden" animate="visible" exit="exit" className="adm-card p-5 max-w-xl space-y-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest" style={{color:'var(--adm-text3)'}}>Email Notifications</p>
                  <p className="text-[0.72rem] leading-relaxed p-3 rounded-lg" style={{background:'var(--adm-card2)',color:'var(--adm-text3)',border:'1px solid var(--adm-border2)'}}>
                    Powered by <strong style={{color:'var(--adm-text2)'}}>Resend</strong>. Configure <code style={{color:'var(--adm-text2)'}}>RESEND_API_KEY</code> and <code style={{color:'var(--adm-text2)'}}>CONTACT_EMAIL_RECIPIENT</code> in <code style={{color:'var(--adm-text2)'}}>env.local</code>.
                  </p>
                  {[
                    {label:'Contact Form Submissions', desc:'Email sent to admin on contact form submit.', active:true,  key:'RESEND_API_KEY'},
                    {label:'Recipient Address',        desc:'Where notification emails are delivered.',   active:true,  key:'CONTACT_EMAIL_RECIPIENT'},
                    {label:'Review Alerts',            desc:'Coming soon — new review needs approval.',   active:false, key:null},
                    {label:'WhatsApp Click Reports',   desc:'Coming soon — daily digest of WA events.',   active:false, key:null},
                  ].map((n,i)=>(
                    <motion.div key={n.label} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      className="flex items-start gap-4 py-3" style={{borderBottom:'1px solid var(--adm-border2)'}}>
                      <div className="w-8 h-4 rounded-full flex-shrink-0 mt-0.5 relative cursor-default"
                        style={{background:n.active?'#18181b':'var(--adm-border)',transition:'background 0.2s'}}>
                        <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{left:n.active?'calc(100% - 0.875rem)':'2px'}}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.78rem] font-semibold" style={{color:'var(--adm-text)'}}>{n.label}</p>
                        <p className="text-[0.68rem]" style={{color:'var(--adm-text3)'}}>{n.desc}</p>
                        {n.key&&<code className="text-[0.62rem]" style={{color:'var(--adm-text2)'}}>{n.key}</code>}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          )}

          </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {delConf&&(
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setDelConf(null)} className="fixed inset-0 z-[60]" style={{background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)'}}/>
            <motion.div variants={MODAL} initial="hidden" animate="visible" exit="exit" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[61] rounded-2xl p-6 shadow-2xl" style={{background:'var(--adm-modal-bg)',border:'1px solid var(--adm-border)'}}>
              <h4 className="text-lg font-semibold mb-2" style={{color:'var(--adm-text)'}}>Delete?</h4>
              <p className="text-[0.78rem] leading-relaxed mb-6" style={{color:'var(--adm-text3)'}}>This is permanent and cannot be undone. Continue?</p>
              <div className="flex gap-3">
                <button onClick={()=>setDelConf(null)} className="adm-btn-ghost flex-1 justify-center">Cancel</button>
                <button onClick={confirmDel} className="adm-btn-primary flex-1 justify-center" style={{background:'#c94040'}}>Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BLOG MODAL ── */}
      <AnimatePresence>
        {showBlog&&(
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}} onClick={()=>setShowBlog(false)} className="fixed inset-0 bg-black z-50"/>
            <motion.div variants={MODAL} initial="hidden" animate="visible" exit="exit" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[51] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" style={{background:'var(--adm-modal-bg)',border:'1px solid var(--adm-border)'}}>
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{background:'var(--adm-modal-bg)',borderBottom:'1px solid var(--adm-border2)'}}>
                <div><h3 className="text-lg font-semibold" style={{color:'var(--adm-text)'}}>{editBlog?'Edit Article':'New Article'}</h3><p className="text-[0.62rem] uppercase tracking-widest" style={{color:'var(--adm-text3)'}}>Blog</p></div>
                <button onClick={()=>setShowBlog(false)} className="adm-icon-btn"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={saveBlog} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Title *</label><input required type="text" value={bTitle} onChange={e=>setBTitle(e.target.value)} placeholder="Article title" className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Slug</label><input type="text" value={bSlug} onChange={e=>setBSlug(e.target.value)} placeholder="url-slug" className={INP}/></div>
                </div>
                <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Content *</label><textarea required value={bContent} onChange={e=>setBContent(e.target.value)} rows={8} placeholder="Full article text…" className={`${INP} resize-none leading-relaxed`}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Category</label><LuxSelect admin value={bCat} onChange={setBCat} options={blogCategories.map((c:any)=>({value:String(c.id),label:c.name}))} placement={'bottom-left'} panelClassName={'min-w-[160px]'} /></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Reading Time (min)</label><input type="number" min={1} value={bTime} onChange={e=>setBTime(Number(e.target.value))} className={INP}/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Cover Image URL</label><input type="url" value={bImg} onChange={e=>setBImg(e.target.value)} placeholder="https://…" className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Tags</label><input type="text" value={bTags} onChange={e=>setBTags(e.target.value)} placeholder="home decor, framing" className={INP}/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>SEO Title</label><input type="text" value={bSeoT} onChange={e=>setBSeoT(e.target.value)} className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>SEO Description</label><input type="text" value={bSeoD} onChange={e=>setBSeoD(e.target.value)} className={INP}/></div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={bPub} onChange={e=>setBPub(e.target.checked)} className="w-4 h-4 rounded accent-neutral-800"/>
                  <span className="text-[0.78rem] font-semibold" style={{color:'var(--adm-text)'}}>Publish immediately (unchecked = draft)</span>
                </label>
                <div className="flex gap-3 pt-2" style={{borderTop:'1px solid var(--adm-border2)'}}>
                  <button type="button" onClick={()=>setShowBlog(false)} className="adm-btn-ghost flex-1 justify-center">Discard</button>
                  <button type="submit" disabled={loading} className="adm-btn-primary flex-1 justify-center" style={{opacity:loading?0.6:1}}>{loading?'Saving…':editBlog?'Update':'Publish'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── VOUCHER MODAL ── */}
      <AnimatePresence>
        {showVoucher&&(
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}} onClick={()=>setShowVoucher(false)} className="fixed inset-0 bg-black z-50"/>
            <motion.div variants={MODAL} initial="hidden" animate="visible" exit="exit" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[51] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" style={{background:'var(--adm-modal-bg)',border:'1px solid var(--adm-border)'}}>
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{background:'var(--adm-modal-bg)',borderBottom:'1px solid var(--adm-border2)'}}>
                <div><h3 className="text-lg font-semibold" style={{color:'var(--adm-text)'}}>{editVoucher?'Edit Voucher':'New Voucher'}</h3><p className="text-[0.62rem] uppercase tracking-widest" style={{color:'var(--adm-text3)'}}>Voucher Management</p></div>
                <button onClick={()=>setShowVoucher(false)} className="adm-icon-btn"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={async(e)=>{
                e.preventDefault(); setSaving(true);
                try{
                  const {supabase}=await import('@/lib/supabase/client');
                  const payload:any={
                    code: vCode.trim().toUpperCase(),
                    description: vDesc||null,
                    discount_type: vType,
                    discount_value: vValue,
                    min_order_value: vMin||null,
                    max_discount: vMax||null,
                    max_global_uses: vMaxUses||null,
                    expiry_date: vExpiry||null,
                    is_active: vActive,
                  };
                  if(editVoucher){
                    const {error}=await supabase.from('vouchers').update(payload).eq('id',editVoucher.id);
                    if(error) throw error;
                    setVouchers(vouchers.map(v=>v.id===editVoucher.id?{...v,...payload}:v));
                    addToast('Voucher updated.','success');
                  } else {
                    const {data,error}=await supabase.from('vouchers').insert(payload).select().single();
                    if(error) throw error;
                    setVouchers([data,...vouchers]);
                    addToast('Voucher created.','success');
                  }
                  setShowVoucher(false);
                }catch(err:any){ addToast(err.message,'error'); }finally{ setSaving(false); }
              }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Code *</label>
                    <input required type="text" value={vCode} onChange={e=>setVCode(e.target.value.toUpperCase())} placeholder="SAVE20" className={INP} style={{fontFamily:'monospace'}}/>
                  </div>
                  <div>
                    <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Discount Type *</label>
                    <LuxSelect admin value={vType} onChange={v=>setVType(v as any)} options={[{value:'percentage',label:'Percentage %'},{value:'fixed_amount',label:'Fixed ₹'}]} placement={'bottom-left'} panelClassName={'min-w-[160px]'} />
                  </div>
                </div>
                <div>
                  <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Description</label>
                  <input type="text" value={vDesc} onChange={e=>setVDesc(e.target.value)} placeholder="e.g. Summer sale 20% off" className={INP}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>{vType==='percentage'?'Discount %':'Discount ₹'} *</label>
                    <input required type="number" min={0} value={vValue} onChange={e=>setVValue(Number(e.target.value))} className={INP}/>
                  </div>
                  <div>
                    <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Min Order Value (₹)</label>
                    <input type="number" min={0} value={vMin||''} onChange={e=>setVMin(Number(e.target.value))} placeholder="0 = no minimum" className={INP}/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {vType==='percentage'&&<div>
                    <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Max Discount Cap (₹)</label>
                    <input type="number" min={0} value={vMax||''} onChange={e=>setVMax(Number(e.target.value))} placeholder="0 = no cap" className={INP}/>
                  </div>}
                  <div>
                    <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Max Total Uses</label>
                    <input type="number" min={0} value={vMaxUses||''} onChange={e=>setVMaxUses(Number(e.target.value))} placeholder="0 = unlimited" className={INP}/>
                  </div>
                </div>
                <div>
                  <label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Expiry Date</label>
                  <input type="date" value={vExpiry} onChange={e=>setVExpiry(e.target.value)} className={INP}/>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={vActive} onChange={e=>setVActive(e.target.checked)} className="w-4 h-4 rounded accent-neutral-800"/>
                  <span className="text-[0.78rem] font-semibold" style={{color:'var(--adm-text)'}}>Active (visible to customers)</span>
                </label>
                <div className="flex gap-3 pt-2" style={{borderTop:'1px solid var(--adm-border2)'}}>
                  <button type="button" onClick={()=>setShowVoucher(false)} className="adm-btn-ghost flex-1 justify-center">Discard</button>
                  <button type="submit" disabled={saving} className="adm-btn-primary flex-1 justify-center" style={{opacity:saving?0.6:1}}>{saving?'Saving…':editVoucher?'Update Voucher':'Create Voucher'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PRODUCT MODAL ── */}
      <AnimatePresence>
        {showProd&&(
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}} onClick={()=>setShowProd(false)} className="fixed inset-0 bg-black z-50"/>
            <motion.div variants={MODAL} initial="hidden" animate="visible" exit="exit" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl z-[51] rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" style={{background:'var(--adm-modal-bg)',border:'1px solid var(--adm-border)'}}>
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{background:'var(--adm-modal-bg)',borderBottom:'1px solid var(--adm-border2)'}}>
                <div><h3 className="text-lg font-semibold" style={{color:'var(--adm-text)'}}>{editProd?'Edit Product':'New Product'}</h3><p className="text-[0.62rem] uppercase tracking-widest" style={{color:'var(--adm-text3)'}}>Products</p></div>
                <button onClick={()=>setShowProd(false)} className="adm-icon-btn"><X className="w-4 h-4"/></button>
              </div>
              <form onSubmit={saveProd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Name *</label><input required type="text" value={pName} onChange={e=>setPName(e.target.value)} placeholder="Classic Walnut Frame" className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>SKU *</label><input required type="text" value={pSku} onChange={e=>setPSku(e.target.value)} placeholder="CAG-WF-001" className={INP}/></div>
                </div>
                <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Short Description *</label><input required type="text" value={pShort} onChange={e=>setPShort(e.target.value)} placeholder="One-line storefront description" className={INP}/></div>
                <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Full Description</label><textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} rows={4} placeholder="Detailed artwork story…" className={`${INP} resize-none`}/></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Base Price (INR) *</label><input required type="number" value={pPrice} onChange={e=>setPPrice(Number(e.target.value))} className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Category</label><LuxSelect admin value={pCat} onChange={setPCat} options={categories.map(c=>({value:String(c.id),label:c.name}))} placement={'bottom-left'} panelClassName={'min-w-[160px]'} /></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Weight</label><input type="text" value={pWeight} onChange={e=>setPWeight(e.target.value)} placeholder="1.5 kg" className={INP}/></div>
                </div>
                {/* Gallery */}
                <div className="rounded-xl p-4 space-y-2" style={{border:'1px solid var(--adm-border2)',background:'var(--adm-card2)'}}>
                  <div className="flex items-center justify-between"><label className={`${LBL} mb-0`} style={{color:'var(--adm-text3)'}}>Gallery Images</label><button type="button" onClick={()=>setPImgs([...pImgs,''])} className="text-[0.65rem] font-bold" style={{color:'var(--adm-text2)'}}>+ Add</button></div>
                  {pImgs.map((url,i)=>(
                    <div key={i} className="flex gap-2 items-center">
                      <input type="url" value={url} placeholder="Image URL" onChange={e=>{const u=[...pImgs];u[i]=e.target.value;setPImgs(u);}} className={`${INP} flex-1`}/>
                      <input type="file" accept="image/*" className="text-[0.65rem] max-w-[110px]" style={{color:'var(--adm-text3)'}}
                        onChange={async e=>{
                          const file=e.target.files?.[0]; if(!file) return;
                          try{ setUploading(true); const fd=new FormData(); fd.append('file',file); fd.append('bucket','product-images');
                            const res=await fetch('/api/upload',{method:'POST',body:fd}); const r=await res.json();
                            if(!res.ok) throw new Error(r.error);
                            const u=[...pImgs]; u[i]=r.publicUrl; setPImgs(u); addToast('Uploaded.','success');
                          }catch(err:any){addToast(err.message,'error');}finally{setUploading(false);}
                        }}/>
                      {pImgs.length>1&&<button type="button" onClick={()=>setPImgs(pImgs.filter((_,j)=>j!==i))} className="text-red-400 font-bold text-lg leading-none px-1">×</button>}
                    </div>
                  ))}
                  {uploading&&<p className="text-[0.68rem] animate-pulse" style={{color:'var(--adm-text2)'}}>Uploading…</p>}
                </div>
                {/* Sizes */}
                <div className="rounded-xl p-4 space-y-2" style={{border:'1px solid var(--adm-border2)',background:'var(--adm-card2)'}}>
                  <div className="flex items-center justify-between"><label className={`${LBL} mb-0`} style={{color:'var(--adm-text3)'}}>Dimension Options</label><button type="button" onClick={()=>setPSizes([...pSizes,{value:'',modifier:0,label:'',tag:'Standard'}])} className="text-[0.65rem] font-bold" style={{color:'var(--adm-text2)'}}>+ Add</button></div>
                  {pSizes.map((sz,i)=>(
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <input type="text" value={sz.label||''} onChange={e=>{const u=[...pSizes];u[i]={...u[i],label:e.target.value};setPSizes(u);}} placeholder="Label" className={`${INP} text-[0.72rem]`}/>
                      <input type="text" required value={sz.value} onChange={e=>{const u=[...pSizes];u[i]={...u[i],value:e.target.value};setPSizes(u);}} placeholder="12 x 15 inches" className={`${INP} text-[0.72rem]`}/>
                      <input type="text" value={sz.tag||''} onChange={e=>{const u=[...pSizes];u[i]={...u[i],tag:e.target.value};setPSizes(u);}} placeholder="Tag" className={`${INP} text-[0.72rem]`}/>
                      <input type="number" value={sz.modifier} onChange={e=>{const u=[...pSizes];u[i]={...u[i],modifier:Number(e.target.value)};setPSizes(u);}} placeholder="₹ mod" className={`${INP} text-[0.72rem]`}/>
                      {pSizes.length>1&&<button type="button" onClick={()=>setPSizes(pSizes.filter((_,j)=>j!==i))} className="text-red-400 font-bold text-lg leading-none">×</button>}
                    </div>
                  ))}
                </div>
                {/* Materials */}
                <div className="rounded-xl p-4 space-y-2" style={{border:'1px solid var(--adm-border2)',background:'var(--adm-card2)'}}>
                  <div className="flex items-center justify-between"><label className={`${LBL} mb-0`} style={{color:'var(--adm-text3)'}}>Frame Materials</label><button type="button" onClick={()=>setPMats([...pMats,{label:'',value:'',tag:'Natural',modifier:0}])} className="text-[0.65rem] font-bold" style={{color:'var(--adm-text2)'}}>+ Add</button></div>
                  {pMats.map((mat,i)=>(
                    <div key={i} className="grid grid-cols-4 gap-2 items-center">
                      <input type="text" required value={mat.label} onChange={e=>{const u=[...pMats];u[i]={...u[i],label:e.target.value};setPMats(u);}} placeholder="Pine Wood" className={`${INP} text-[0.72rem]`}/>
                      <input type="text" required value={mat.value} onChange={e=>{const u=[...pMats];u[i]={...u[i],value:e.target.value};setPMats(u);}} placeholder="Solid Pine Wood" className={`${INP} text-[0.72rem]`}/>
                      <input type="text" value={mat.tag} onChange={e=>{const u=[...pMats];u[i]={...u[i],tag:e.target.value};setPMats(u);}} placeholder="Tag" className={`${INP} text-[0.72rem]`}/>
                      <div className="flex gap-2 items-center">
                        <input type="number" value={mat.modifier} onChange={e=>{const u=[...pMats];u[i]={...u[i],modifier:Number(e.target.value)};setPMats(u);}} placeholder="₹" className={`${INP} flex-1 text-[0.72rem]`}/>
                        {pMats.length>1&&<button type="button" onClick={()=>setPMats(pMats.filter((_,j)=>j!==i))} className="text-red-400 font-bold text-lg leading-none">×</button>}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Colors */}
                <div className="rounded-xl p-4 space-y-2" style={{border:'1px solid var(--adm-border2)',background:'var(--adm-card2)'}}>
                  <div className="flex items-center justify-between"><label className={`${LBL} mb-0`} style={{color:'var(--adm-text3)'}}>Color Finishes</label><button type="button" onClick={()=>setPCols([...pCols,{label:'',modifier:0}])} className="text-[0.65rem] font-bold" style={{color:'var(--adm-text2)'}}>+ Add</button></div>
                  {pCols.map((col,i)=>(
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" required value={col.label} onChange={e=>{const u=[...pCols];u[i]={...u[i],label:e.target.value};setPCols(u);}} placeholder="Walnut Brown" className={`${INP} flex-1 text-[0.72rem]`}/>
                      <input type="number" value={col.modifier} onChange={e=>{const u=[...pCols];u[i]={...u[i],modifier:Number(e.target.value)};setPCols(u);}} placeholder="₹ mod" className={`${INP} w-24 text-[0.72rem]`}/>
                      {pCols.length>1&&<button type="button" onClick={()=>setPCols(pCols.filter((_,j)=>j!==i))} className="text-red-400 font-bold text-lg leading-none">×</button>}
                    </div>
                  ))}
                </div>
                {/* Tags + SEO */}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>Tags</label><input type="text" value={pTags} onChange={e=>setPTags(e.target.value)} placeholder="walnut, frame" className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>SEO Title</label><input type="text" value={pSeoT} onChange={e=>setPSeoT(e.target.value)} className={INP}/></div>
                  <div><label className={`${LBL}`} style={{color:'var(--adm-text3)'}}>SEO Description</label><input type="text" value={pSeoD} onChange={e=>setPSeoD(e.target.value)} className={INP}/></div>
                </div>
                {/* Flags */}
                <div className="flex flex-wrap gap-4 py-1">
                  {[{label:'Customizable',val:pCustom,set:setPCustom},{label:'Featured',val:pFeat,set:setPFeat},{label:'Trending',val:pTrend,set:setPTrend},{label:'Best Seller',val:pBest,set:setPBest}].map(f=>(
                    <label key={f.label} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={f.val} onChange={e=>f.set(e.target.checked)} className="w-4 h-4 rounded accent-neutral-800"/>
                      <span className="text-[0.78rem] font-semibold" style={{color:'var(--adm-text)'}}>{f.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 pt-2" style={{borderTop:'1px solid var(--adm-border2)'}}>
                  <button type="button" onClick={()=>setShowProd(false)} className="adm-btn-ghost flex-1 justify-center">Discard</button>
                  <button type="submit" disabled={saving||uploading||!pName||!pSku} className="adm-btn-primary flex-1 justify-center" style={{opacity:saving||uploading?0.6:1}}>
                    {saving?'Saving…':editProd?'Update Product':'Save product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
