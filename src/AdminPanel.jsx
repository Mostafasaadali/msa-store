import React, { useState, useMemo } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore'; 
import { db } from './firebase';

export default function AdminPanel({
  products, setProducts, handleSaveProduct, handleDeleteProduct, handleEditClick,
  newProdName, setNewProdName,
  newProdPrice, setNewProdPrice,
  newProdImg, setNewProdImg,
  newProdDesc, setNewProdDesc,
  newProdImages, setNewProdImages,
  newProdStock, setNewProdStock, 
  newProdOrderIndex, setNewProdOrderIndex,
  
  newProdCategory, setNewProdCategory,
  categories, handleAddCategory, handleDeleteCategory, handleEditCategory,
  
  newProdChip, setNewProdChip,
  newProdCode, setNewProdCode,
  
  newProdCompatLink, setNewProdCompatLink,
  newProdCompatIds, setNewProdCompatIds,
  newProdLibLink, setNewProdLibLink,
  newProdCodeSnippet, setNewProdCodeSnippet,
  
  projectsList, setProjectsList, fetchProjectsData,
  
  externalLinks, setExternalLinks,

  editProdId,
  orders, fetchOrders,
  handleDeleteOrder,
  handleCancelOrder,
  handleCompleteOrder,
  visitorCount,
  handleResetVisitors, 
  
  deliveryLocations, setDeliveryLocations,
  
  // استدعاء خصائص إعلان السلة
  cartAnnouncement, handleSaveCartAnnouncement
}) {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrdersManager, setShowOrdersManager] = useState(false);
  const [showCompletedOrdersManager, setShowCompletedOrdersManager] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [editCatId, setEditCatId] = useState(null);
  const [editCatInput, setEditCatInput] = useState('');

  const [showDeliveryManager, setShowDeliveryManager] = useState(false);
  const [newGovName, setNewGovName] = useState('');
  const [newGovPrice, setNewGovPrice] = useState('');
  const [newGovTime, setNewGovTime] = useState('');

  const [showProjectsManager, setShowProjectsManager] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjCat, setNewProjCat] = useState('');
  const [newProjImg, setNewProjImg] = useState(''); 
  const [newProjImages, setNewProjImages] = useState([]);

  const [showLinksManager, setShowLinksManager] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // حالات خاصة بإعلان السلة
  const [showAnnouncementManager, setShowAnnouncementManager] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');

  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  
  const [selectedCompatToAdd, setSelectedCompatToAdd] = useState(''); // State لإضافة المنتجات المتوافقة

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const confirmAndCompleteOrder = (order) => {
    if(window.confirm("هل أنت متأكد من إنجاز هذا الطلب؟ (هذا الخيار يعني أنك قمت بتسليمه بنجاح ولن يتم إرجاع المخزون وسينقل للمكتملة)")) {
      handleCompleteOrder(order);
      setSelectedOrder(null);
    }
  };

  const handleAddDeliveryLocation = async (e) => {
    e.preventDefault();
    if (!newGovName || !newGovPrice) {
       alert("يرجى إدخال اسم المحافظة وسعر التوصيل على الأقل.");
       return;
    }
    const payload = { 
       name: String(newGovName), 
       price: Number(newGovPrice), 
       time: String(newGovTime || 'غير محدد') 
    };

    try {
      const docRef = await addDoc(collection(db, "delivery_locations"), payload);
      setDeliveryLocations(prev => {
        const updated = [...prev, { id: docRef.id, ...payload }];
        localStorage.setItem("msa_delivery_cache", JSON.stringify(updated));
        return updated;
      });
      setNewGovName('');
      setNewGovPrice('');
      setNewGovTime('');
      alert("تمت إضافة منطقة التوصيل بنجاح!");
    } catch (err) {
      console.error("Firestore error:", err);
      alert("حدث خطأ في الاتصال بالسحابة. تأكد من قواعد الحماية.");
    }
  };

  const handleDeleteDeliveryLocation = async (id) => {
    if(window.confirm("هل أنت متأكد من حذف هذه المحافظة من قائمة التوصيل؟")) {
       try {
         await deleteDoc(doc(db, "delivery_locations", id));
         setDeliveryLocations(prev => {
           const updated = prev.filter(loc => loc.id !== id);
           localStorage.setItem("msa_delivery_cache", JSON.stringify(updated));
           return updated;
         });
       } catch(err) {
         console.error("Delete error:", err);
         alert("حدث خطأ أثناء الحذف من السحابة.");
       }
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if(!newProjName || !newProjDesc) {
        alert("يرجى إدخال اسم المشروع ووصفه.");
        return;
    }
    
    const filteredExtraImages = newProjImages.filter(url => url && url.trim() !== '');

    try {
        const payload = { 
            name: newProjName, 
            desc: newProjDesc, 
            category: newProjCat, 
            img: newProjImg,
            images: filteredExtraImages 
        };
        const docRef = await addDoc(collection(db, "projects"), payload);
        setProjectsList([...projectsList, { id: docRef.id, ...payload }]);
        setNewProjName('');
        setNewProjDesc('');
        setNewProjCat('');
        setNewProjImg('');
        setNewProjImages([]);
        alert("تمت إضافة المشروع بنجاح إلى المعرض!");
    } catch (err) {
        alert("فشل إضافة المشروع.");
    }
  };

  const handleDeleteProject = async (id) => {
      if(window.confirm("هل أنت متأكد من حذف هذا المشروع بجميع صوره؟")) {
          try {
              await deleteDoc(doc(db, "projects", id));
              setProjectsList(projectsList.filter(p => p.id !== id));
          } catch (err) {
              alert("فشل الحذف.");
          }
      }
  };

  const handleAddExternalLink = async (e) => {
    e.preventDefault();
    if(!newLinkTitle || !newLinkUrl) {
       alert("يرجى إدخال عنوان ووصف الرابط ومساره الصحيح.");
       return;
    }
    try {
       const urlToSave = newLinkUrl.startsWith('http') ? newLinkUrl : 'https://' + newLinkUrl;
       const payload = { title: newLinkTitle, url: urlToSave };
       const docRef = await addDoc(collection(db, "external_links"), payload);
       setExternalLinks([...externalLinks, { id: docRef.id, ...payload }]);
       setNewLinkTitle('');
       setNewLinkUrl('');
       alert("تم حفظ الرابط بنجاح! سيظهر الآن في القائمة الجانبية.");
    } catch (err) {
       alert("فشل حفظ الرابط في قاعدة البيانات.");
    }
  };

  const handleDeleteExternalLink = async (id) => {
    if(window.confirm("هل أنت متأكد من حذف هذا الرابط من القائمة الجانبية؟")) {
       try {
          await deleteDoc(doc(db, "external_links", id));
          setExternalLinks(externalLinks.filter(l => l.id !== id));
       } catch (err) {
          alert("فشل عملية الحذف.");
       }
    }
  };

  const filteredAdminProducts = useMemo(() => {
    return products.filter(p => {
      const searchLower = adminSearch.toLowerCase();
      const matchesSearch = adminSearch === '' || 
                            p.name?.toLowerCase().includes(searchLower) || 
                            p.code?.toLowerCase().includes(searchLower) ||
                            p.category?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
      
      if (adminFilter === 'outOfStock') return (parseInt(p.stock) || 0) <= 0;
      return true;
    }).sort((a, b) => {
      if (adminFilter === 'bestSeller') {
          return (parseInt(b.sales) || 0) - (parseInt(a.sales) || 0);
      }
      const indexA = a.orderIndex !== undefined && a.orderIndex !== null && a.orderIndex !== '' ? parseInt(a.orderIndex) : 999;
      const indexB = b.orderIndex !== undefined && b.orderIndex !== null && b.orderIndex !== '' ? parseInt(b.orderIndex) : 999;
      if (indexA !== indexB) {
          return indexA - indexB;
      }
      return 0; 
    });
  }, [products, adminSearch, adminFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 font-sans relative w-full">
      
      <div className="mb-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1 text-transparent bg-clip-text bg-gradient-to-l from-teal-400 to-blue-900">
            لوحة الإدارة
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 w-full border-b border-teal-500/20 pb-6">
         <button
            onClick={() => { setShowOrdersManager(true); fetchOrders(); }}
            className={`mr-auto transition-all shrink-0 font-bold flex items-center shadow-sm relative ${
               activeOrders.length > 0
               ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-2xl text-sm border-2 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-110 hover:scale-110 animate-pulse cursor-pointer z-50'
               : 'bg-[#11192b] border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs cursor-pointer'
            }`}
         >
            <i className={`fa-solid fa-boxes-packing ${activeOrders.length > 0 ? 'text-xl ml-2 animate-bounce' : 'ml-2'}`}></i>
            <span>الطلبات الجديدة</span>
            {activeOrders.length > 0 && (
               <span className="absolute -top-3 -right-3 bg-white text-red-600 font-black w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-lg border-2 border-red-500">
                  {activeOrders.length}
               </span>
            )}
         </button>

         <button
            onClick={() => { setShowCompletedOrdersManager(true); fetchOrders(); }}
            className="bg-[#11192b] border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 shadow-sm flex items-center gap-2"
         >
            <i className="fa-solid fa-check-double text-sm"></i>
            <span>الطلبات المكتملة</span>
            {completedOrders.length > 0 && (
               <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px] ml-1">{completedOrders.length}</span>
            )}
         </button>

         <div className="bg-[#11192b] border border-teal-500/30 px-3 py-2 rounded-xl flex items-center gap-3 shadow-lg shrink-0">
            <i className="fa-solid fa-chart-pie text-teal-400 text-sm"></i>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-400 font-mono">الزيارات:</span>
               <span className="text-sm font-black text-white" dir="ltr">{visitorCount}</span>
            </div>
         </div>

         {/* الزر الخاص بإضافة الإعلان للسلة */}
         <button onClick={() => { setAnnouncementInput(cartAnnouncement || ''); setShowAnnouncementManager(true); }} className="bg-[#11192b] border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-bullhorn"></i> إعلان السلة
         </button>
         
         <button onClick={() => setShowLinksManager(true)} className="bg-[#030212] border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-link"></i> إدارة الروابط
         </button>
         
         <button onClick={() => { if(fetchProjectsData) fetchProjectsData(); setShowProjectsManager(true); }} className="bg-[#11192b] border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-diagram-project"></i> المشاريع
         </button>
         
         <button onClick={() => setShowDeliveryManager(true)} className="bg-[#11192b] border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-map-location-dot"></i> التوصيل
         </button>

         <button
            type="button"
            onClick={handleResetVisitors}
            className="bg-[#030212] border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm text-[11px] shrink-0"
            title="تصفير عداد الزوار"
         >
            <i className="fas fa-users-slash"></i> تصفير الزوار
         </button>
      </div>

      <div className="space-y-8 w-full">
         
         <div className={`border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl transition-all w-full ${editProdId ? 'border-orange-500/50 bg-orange-900/10' : 'border-teal-500/20 bg-[#11192b]'}`}>
           <h3 className="text-base sm:text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 border-b border-neutral-800 pb-3">
             <i className={`fa-solid ${editProdId ? 'fa-pen-to-square text-orange-500' : 'fa-square-plus text-teal-500'}`}></i> 
             {editProdId ? 'تعديل بيانات القطعة' : 'إضافة قطعة إلكترونية جديدة'}
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_NAME</label>
                 <input type="text" placeholder="اسم المنتج" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
               </div>
               
               <div>
                 <label className="text-[10px] sm:text-xs font-mono font-bold text-teal-400 block mb-2">// PROD_CATEGORY</label>
                 <div className="flex gap-2">
                   <select 
                     value={newProdCategory} 
                     onChange={(e) => setNewProdCategory(e.target.value)} 
                     className="w-full p-2.5 sm:p-3 bg-black/40 border border-teal-500/30 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner appearance-none cursor-pointer"
                   >
                     <option value="" className="bg-neutral-900 text-gray-500">-- غير محدد --</option>
                     {(categories || []).map(c => (
                       <option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>
                     ))}
                   </select>
                   <button 
                     type="button"
                     onClick={(e) => { e.preventDefault(); setShowCatManager(true); }} 
                     className="px-3 sm:px-4 py-2 sm:py-3 bg-teal-600/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-black rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap shadow-inner shrink-0"
                     title="إدارة القائمة"
                   >
                     <i className="fa-solid fa-list"></i> القوائم
                   </button>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="flex-1 min-w-0">
                   <label className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 block mb-2">// PRICE_IQD</label>
                   <input type="number" placeholder="السعر" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <label className="text-[10px] sm:text-xs font-mono font-bold text-teal-400 block mb-2">// STOCK</label>
                   <input type="number" placeholder="المخزون" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-teal-500/30 text-teal-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <label className="text-[10px] sm:text-xs font-mono font-bold text-purple-400 block mb-2">// ORDER_INDEX</label>
                   <input type="number" placeholder="ترتيب العرض (1)" value={newProdOrderIndex} onChange={(e) => setNewProdOrderIndex(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-purple-500/30 text-purple-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors shadow-inner" />
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="flex-1 min-w-0">
                   <label className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 block mb-2">// CHIP</label>
                   <input type="text" placeholder="MCU v3" value={newProdChip} onChange={(e) => setNewProdChip(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-neutral-800 text-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <label className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 block mb-2">// CODE</label>
                   <input type="text" placeholder="ATMEGA" value={newProdCode} onChange={(e) => setNewProdCode(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-neutral-800 text-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <div>
                 <label className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 block mb-2">// DESCRIPTION</label>
                 <textarea placeholder="وصف مفصل للمنتج..." value={newProdDesc || ''} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner min-h-[90px]" rows="3"></textarea>
               </div>

               <div>
                 <label className="text-[10px] sm:text-xs font-mono font-bold text-gray-400 block mb-2">// MAIN_IMAGE</label>
                 <input type="text" placeholder="رابط الصورة الأساسية (URL)" value={newProdImg || ''} onChange={(e) => setNewProdImg(e.target.value)} className="w-full p-2.5 sm:p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" dir="ltr" />
               </div>

               <div className="bg-black/30 p-3 rounded-xl border border-neutral-800">
                 <label className="text-[10px] sm:text-xs font-mono font-bold text-teal-400 block mb-3">// GALLERY ({newProdImages?.length || 0}/10)</label>
                 
                 <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1">
                   {(newProdImages || []).map((imgUrl, index) => (
                     <div key={index} className="flex gap-2 mb-2">
                       <input type="text" placeholder={`صورة إضافية ${index + 1}`} value={imgUrl} onChange={(e) => {
                         const newImgs = [...newProdImages];
                         newImgs[index] = e.target.value;
                         setNewProdImages(newImgs);
                       }} className="w-full p-2 bg-black/60 border border-neutral-700 text-white rounded-lg text-[10px] sm:text-xs focus:outline-none focus:border-teal-500 transition-colors shadow-inner" dir="ltr" />
                       <button type="button" onClick={(e) => { e.preventDefault(); setNewProdImages(newProdImages.filter((_, i) => i !== index)); }} className="p-2 shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20" title="حذف الصورة">
                         <i className="fa-solid fa-trash-can text-xs"></i>
                       </button>
                     </div>
                   ))}
                 </div>
                 
                 {(newProdImages || []).length < 10 && (
                   <button type="button" onClick={(e) => { e.preventDefault(); setNewProdImages([...(newProdImages || []), '']); }} className="w-full py-2 mt-1 border border-dashed border-teal-500/40 text-teal-500 hover:bg-teal-500/10 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2">
                     <i className="fa-solid fa-plus"></i> إضافة صورة أخرى
                   </button>
                 )}
               </div>
             </div>

             <div className="space-y-4 flex flex-col justify-between">
                <div className="bg-teal-900/10 p-3 sm:p-4 border border-teal-500/20 rounded-xl space-y-4 flex-grow">
                   <h4 className="text-teal-400 font-bold text-xs sm:text-sm border-b border-teal-500/20 pb-2"><i className="fa-solid fa-code-branch"></i> المرفقات والبرمجيات</h4>
                   
                   <div>
                     <label className="text-[9px] sm:text-[10px] font-mono text-gray-400 block mb-1">Code Snippet</label>
                     <textarea dir="ltr" placeholder="void setup() { ... }" value={newProdCodeSnippet || ''} onChange={(e) => setNewProdCodeSnippet(e.target.value)} className="w-full p-2 sm:p-3 font-mono bg-black/60 border border-neutral-700 text-teal-300 rounded-xl text-[10px] sm:text-xs focus:outline-none focus:border-teal-500 transition-colors shadow-inner min-h-[70px]" rows="3"></textarea>
                   </div>
                   
                   <div>
                     <label className="text-[9px] sm:text-[10px] font-mono text-gray-400 block mb-1">المنتجات المتوافقة (اختر وأضف)</label>
                     <div className="flex gap-2 mb-2">
                        <select 
                           value={selectedCompatToAdd} 
                           onChange={(e) => setSelectedCompatToAdd(e.target.value)} 
                           className="w-full p-2 bg-black/40 border border-neutral-700 text-teal-400 rounded-lg text-[10px] sm:text-xs outline-none focus:border-teal-500 cursor-pointer"
                        >
                           <option value="">-- اختر منتج للتوافق --</option>
                           {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button 
                           type="button" 
                           onClick={(e) => {
                              e.preventDefault();
                              if(selectedCompatToAdd && !newProdCompatIds.includes(selectedCompatToAdd)) {
                                 setNewProdCompatIds([...newProdCompatIds, selectedCompatToAdd]);
                                 setSelectedCompatToAdd('');
                              }
                           }} 
                           className="px-3 py-2 bg-teal-600/20 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500 hover:text-slate-900 text-xs font-bold transition-colors"
                        >
                           إضافة
                        </button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {newProdCompatIds.map(id => {
                           const p = products.find(x => x.id === id);
                           return p ? (
                              <span key={id} className="bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-sm">
                                 {p.name}
                                 <button type="button" onClick={() => setNewProdCompatIds(newProdCompatIds.filter(x => x !== id))} className="text-red-400 hover:text-red-300 ml-1 transition-colors">
                                     <i className="fa-solid fa-xmark"></i>
                                 </button>
                              </span>
                           ) : null;
                        })}
                     </div>
                   </div>

                   <div>
                     <label className="text-[9px] sm:text-[10px] font-mono text-gray-400 block mb-1">رابط مادة تتوافق معه (خارجي)</label>
                     <input type="text" dir="ltr" placeholder="https://..." value={newProdCompatLink || ''} onChange={(e) => setNewProdCompatLink(e.target.value)} className="w-full p-2 bg-black/40 border border-neutral-700 text-blue-400 rounded-lg text-[10px] sm:text-xs outline-none focus:border-blue-500" />
                   </div>

                   <div>
                     <label className="text-[9px] sm:text-[10px] font-mono text-gray-400 block mb-1">رابط المكتبة</label>
                     <input type="text" dir="ltr" placeholder="https://github.com/..." value={newProdLibLink || ''} onChange={(e) => setNewProdLibLink(e.target.value)} className="w-full p-2 bg-black/40 border border-neutral-700 text-orange-400 rounded-lg text-[10px] sm:text-xs outline-none focus:border-orange-500" />
                   </div>
                </div>

                <button type="button" onClick={(e) => { e.preventDefault(); handleSaveProduct(); }} className={`w-full py-3 mt-4 rounded-xl text-white font-bold text-xs sm:text-sm tracking-wider transition-all shadow-lg shrink-0 ${editProdId ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500' : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500'}`}>
                  <i className="fa-solid fa-cloud-arrow-up"></i> {editProdId ? 'حفظ التعديلات' : 'إضافة القطعة للقاعدة'}
                </button>
             </div>
           </div>
         </div>

         <div className="border border-neutral-800 rounded-2xl p-4 sm:p-6 bg-[#0d1526] shadow-xl overflow-hidden w-full">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-neutral-800 pb-4">
             <h3 className="text-base sm:text-lg font-bold text-gray-200 flex items-center gap-2">
               <i className="fa-solid fa-list-check text-teal-500"></i> الكتالوج ({filteredAdminProducts.length})
             </h3>
             
             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
               <div className="flex flex-wrap gap-2">
                  <button onClick={() => setAdminFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${adminFilter === 'all' ? 'bg-teal-500 text-slate-900 border-teal-500' : 'bg-[#111827] text-gray-400 border-neutral-700 hover:border-teal-500'}`}>
                    الكل
                  </button>
                  <button onClick={() => setAdminFilter('outOfStock')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border flex items-center gap-1 ${adminFilter === 'outOfStock' ? 'bg-red-500 text-white border-red-500' : 'bg-[#111827] text-gray-400 border-neutral-700 hover:border-red-500'}`}>
                    <i className="fa-solid fa-triangle-exclamation"></i> المواد النافذة
                  </button>
                  <button onClick={() => setAdminFilter('bestSeller')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border flex items-center gap-1 ${adminFilter === 'bestSeller' ? 'bg-yellow-500 text-slate-900 border-yellow-500' : 'bg-[#111827] text-gray-400 border-neutral-700 hover:border-yellow-500'}`}>
                    <i className="fa-solid fa-fire"></i> الأكثر مبيعاً
                  </button>
               </div>
               
               <div className="relative w-full sm:w-56 shrink-0">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                     type="text" 
                     placeholder="بحث سريع في الكتالوج..." 
                     value={adminSearch} 
                     onChange={e => setAdminSearch(e.target.value)} 
                     className="w-full pl-8 pr-3 py-1.5 bg-[#111827] border border-neutral-700 rounded-lg text-xs text-white focus:border-teal-500 outline-none shadow-inner" 
                  />
               </div>
             </div>
           </div>

           <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-right border-collapse min-w-[600px]">
               <thead>
                 <tr className="border-b border-neutral-800 text-xs font-mono text-gray-500">
                   <th className="pb-3 text-center w-16">الصورة</th>
                   <th className="pb-3 pr-4">اسم القطعة والتفاصيل</th>
                   <th className="pb-3 text-center">السعر</th>
                   <th className="pb-3 text-center">المبيعات</th>
                   <th className="pb-3 text-center">المخزون</th>
                   <th className="pb-3 text-center text-purple-400">الترتيب</th>
                   <th className="pb-3 text-center w-32">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-neutral-800/60 text-sm">
                 {filteredAdminProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500 font-mono text-sm">لا توجد منتجات تطابق بحثك حالياً.</td>
                    </tr>
                 ) : filteredAdminProducts.map((prod) => (
                   <tr key={prod.id} className={`transition-colors ${adminFilter === 'outOfStock' ? 'bg-red-900/5 hover:bg-red-900/10' : 'hover:bg-neutral-900/50'}`}>
                     <td className="py-3 sm:py-4 text-center relative">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg p-1 border border-neutral-700 flex items-center justify-center mx-auto relative overflow-hidden shrink-0">
                         <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} loading="lazy" decoding="async" alt="" className="object-contain max-h-full max-w-full mix-blend-multiply" />
                       </div>
                       {prod.images && prod.images.length > 1 && (
                         <span className="absolute -top-1 -right-1 bg-teal-500 text-black text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-black z-10">
                           +{prod.images.length - 1}
                         </span>
                       )}
                     </td>
                     <td className="py-3 sm:py-4 pr-4 text-gray-200 font-bold min-w-[150px]">
                       <div className="line-clamp-2 break-words text-xs sm:text-sm" title={prod.name}>{prod.name}</div>
                       <div className="mt-1 flex gap-1 flex-wrap">
                          {prod.category && <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono whitespace-nowrap">{prod.category}</span>}
                          {prod.code && <span className="bg-neutral-800 border border-neutral-700 text-gray-400 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono whitespace-nowrap">{prod.code}</span>}
                          {(prod.compatLink || prod.libLink || prod.codeSnippet || (prod.compatProdIds && prod.compatProdIds.length > 0)) && (
                             <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono whitespace-nowrap" title="يحتوي على ملحقات وبرمجيات"><i className="fa-solid fa-paperclip"></i> مدعوم</span>
                          )}
                       </div>
                     </td>
                     <td className="py-3 sm:py-4 text-center font-mono font-bold text-teal-400 whitespace-nowrap text-xs sm:text-sm">{prod.price.toLocaleString()} د.ع</td>
                     
                     <td className="py-3 sm:py-4 text-center font-mono text-yellow-500 whitespace-nowrap text-xs">
                        <i className="fa-solid fa-fire text-[10px]"></i> {prod.sales || 0}
                     </td>

                     <td className="py-3 sm:py-4 text-center font-mono font-bold whitespace-nowrap text-xs sm:text-sm">
                        {(parseInt(prod.stock)||0) <= 0 ? <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">نافذ (0)</span> : <span className="text-orange-400">{prod.stock}</span>}
                     </td>
                     
                     <td className="py-3 sm:py-4 text-center font-mono font-bold text-purple-400 whitespace-nowrap text-xs sm:text-sm">
                        {prod.orderIndex !== undefined && prod.orderIndex !== null ? prod.orderIndex : '999'}
                     </td>

                     <td className="py-3 sm:py-4 text-center">
                       <div className="flex justify-center gap-2 mt-1 sm:mt-2">
                           <button type="button" onClick={(e) => { e.preventDefault(); handleEditClick(prod); }} className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center bg-orange-600/10 border border-orange-500/30 hover:bg-orange-600 hover:text-white text-orange-400 rounded-lg text-xs transition-all shadow-sm">
                             <i className="fa-solid fa-pen"></i>
                           </button>
                           <button type="button" onClick={(e) => { e.preventDefault(); handleDeleteProduct(prod.id); }} className="w-7 h-7 sm:w-8 sm:h-8 flex justify-center items-center bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 rounded-lg text-xs transition-all shadow-sm">
                             <i className="fa-solid fa-trash-can"></i>
                           </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      </div>

      {showCatManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCatManager(false)}></div>
          <div className="relative bg-[#0c0c11] border border-teal-500/40 p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <button type="button" onClick={() => setShowCatManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h3 className="text-xl font-bold text-teal-400 mb-4"><i className="fa-solid fa-list"></i> إدارة القوائم (الفئات)</h3>
            <div className="flex gap-2 mb-4">
               <input type="text" placeholder="اسم الفئة الجديدة" value={newCatInput} onChange={e => setNewCatInput(e.target.value)} className="flex-grow p-2 bg-black/40 border border-teal-500/30 text-white rounded-xl focus:border-teal-500 outline-none" />
               <button onClick={() => { handleAddCategory(newCatInput); setNewCatInput(''); }} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl font-bold">إضافة</button>
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
               {(categories || []).map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 bg-black/40 border border-teal-500/20 rounded-xl">
                     {editCatId === cat.id ? (
                        <div className="flex gap-2 w-full">
                           <input type="text" value={editCatInput} onChange={e => setEditCatInput(e.target.value)} className="flex-grow p-1 bg-black/60 border border-teal-500/50 text-white rounded outline-none" />
                           <button onClick={() => { handleEditCategory(cat.id, cat.name, editCatInput); setEditCatId(null); }} className="text-green-400 hover:text-green-300"><i className="fa-solid fa-check"></i></button>
                        </div>
                     ) : (
                        <>
                           <span className="text-gray-200">{cat.name}</span>
                           <div className="flex gap-3">
                              <button onClick={() => { setEditCatId(cat.id); setEditCatInput(cat.name); }} className="text-orange-400 hover:text-orange-300"><i className="fa-solid fa-pen"></i></button>
                              <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-red-400 hover:text-red-300"><i className="fa-solid fa-trash"></i></button>
                           </div>
                        </>
                     )}
                  </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال إعلان السلة */}
      {showAnnouncementManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAnnouncementManager(false)}></div>
          <div className="relative bg-[#0c0c11] border border-yellow-500/40 p-6 rounded-3xl w-full max-w-lg shadow-2xl">
             <button type="button" onClick={() => setShowAnnouncementManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
               <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <h3 className="text-xl font-bold text-yellow-400 mb-4"><i className="fa-solid fa-bullhorn"></i> إدارة إعلان سلة الطلبات</h3>
             <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-yellow-500/20">
                <p className="text-xs text-gray-400 mb-2">اكتب الإعلان الذي سيظهر أعلى السلة للزبائن. اتركه فارغاً وسوف يتم إخفاء الإعلان تلقائياً من السلة.</p>
                <textarea placeholder="أدخل نص الإعلان هنا..." value={announcementInput} onChange={e => setAnnouncementInput(e.target.value)} className="w-full p-3 bg-black/60 border border-yellow-500/30 text-white rounded-lg outline-none min-h-[100px]"></textarea>
                <button onClick={() => { handleSaveCartAnnouncement(announcementInput); setShowAnnouncementManager(false); }} className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 py-3 rounded-lg font-bold transition-colors">حفظ الإعلان ونشره</button>
             </div>
          </div>
        </div>
      )}

      {showDeliveryManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDeliveryManager(false)}></div>
          <div className="relative bg-[#0c0c11] border border-teal-500/40 p-6 rounded-3xl w-full max-w-lg shadow-2xl">
             <button type="button" onClick={() => setShowDeliveryManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
               <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <h3 className="text-xl font-bold text-teal-400 mb-4"><i className="fa-solid fa-map-location-dot"></i> إدارة مناطق التوصيل</h3>
             <form onSubmit={handleAddDeliveryLocation} className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-teal-500/20">
                <input type="text" placeholder="اسم المحافظة/المنطقة" value={newGovName} onChange={e => setNewGovName(e.target.value)} required className="w-full p-2 bg-black/60 border border-teal-500/30 text-white rounded-lg outline-none" />
                <input type="number" placeholder="سعر التوصيل (د.ع)" value={newGovPrice} onChange={e => setNewGovPrice(e.target.value)} required className="w-full p-2 bg-black/60 border border-teal-500/30 text-white rounded-lg outline-none" />
                <input type="text" placeholder="وقت التوصيل (مثال: 2-3 أيام)" value={newGovTime} onChange={e => setNewGovTime(e.target.value)} required className="w-full p-2 bg-black/60 border border-teal-500/30 text-white rounded-lg outline-none" />
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg font-bold">إضافة المنطقة</button>
             </form>
             <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                {deliveryLocations.map(loc => (
                   <div key={loc.id} className="flex justify-between items-center p-3 bg-black/40 border border-teal-500/20 rounded-xl">
                      <div>
                         <div className="text-white font-bold">{loc.name}</div>
                         <div className="text-teal-400 text-xs">{Number(loc.price).toLocaleString()} د.ع | {loc.time}</div>
                      </div>
                      <button onClick={() => handleDeleteDeliveryLocation(loc.id)} className="text-red-400 hover:text-red-300 p-2"><i className="fa-solid fa-trash"></i></button>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {showLinksManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLinksManager(false)}></div>
          <div className="relative bg-[#0c0c11] border border-purple-500/40 p-6 rounded-3xl w-full max-w-lg shadow-2xl">
             <button type="button" onClick={() => setShowLinksManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
               <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <h3 className="text-xl font-bold text-purple-400 mb-4"><i className="fa-solid fa-link"></i> إدارة الروابط الخارجية</h3>
             <form onSubmit={handleAddExternalLink} className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-purple-500/20">
                <input type="text" placeholder="عنوان الرابط" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} required className="w-full p-2 bg-black/60 border border-purple-500/30 text-white rounded-lg outline-none" />
                <input type="text" placeholder="رابط URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} required className="w-full p-2 bg-black/60 border border-purple-500/30 text-white rounded-lg outline-none" dir="ltr" />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-bold">حفظ الرابط</button>
             </form>
             <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                {externalLinks.map(link => (
                   <div key={link.id} className="flex justify-between items-center p-3 bg-black/40 border border-purple-500/20 rounded-xl">
                      <div>
                         <div className="text-white font-bold">{link.title}</div>
                         <a href={link.url} target="_blank" rel="noreferrer" className="text-purple-400 text-xs underline">{link.url}</a>
                       </div>
                      <button onClick={() => handleDeleteExternalLink(link.id)} className="text-red-400 hover:text-red-300 p-2"><i className="fa-solid fa-trash"></i></button>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {showOrdersManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowOrdersManager(false)}></div>

          <div
            className="relative w-full max-w-6xl bg-[#0c0c11] border border-emerald-500/40 p-4 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowOrdersManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl sm:text-2xl"></i>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-neutral-800 pb-4 gap-4 pr-8 sm:pr-0">
               <h3 className="text-lg sm:text-2xl font-bold text-emerald-400 flex items-center gap-3">
                 <i className="fa-solid fa-boxes-packing"></i> طلبات الزبائن (قيد التجهيز)
               </h3>
               <button type="button" onClick={(e) => { e.preventDefault(); fetchOrders(); }} className="bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-500 text-emerald-400 hover:text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0">
                 <i className="fa-solid fa-rotate"></i> تحديث
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               {activeOrders.length === 0 ? (
                 <div className="col-span-full text-center py-12 border border-dashed border-neutral-700 rounded-xl bg-black/20">
                    <i className="fa-solid fa-inbox text-4xl text-neutral-600 mb-3"></i>
                    <p className="text-gray-500 font-mono text-xs sm:text-sm">لا توجد طلبات قيد التجهيز حالياً.</p>
                 </div>
               ) : activeOrders.map((order) => (
                 <div 
                   key={order.id} 
                   onClick={() => setSelectedOrder(order)} 
                   className="border border-neutral-800 bg-black/40 rounded-2xl p-4 sm:p-5 shadow-md hover:border-emerald-500/60 hover:bg-[#14151c] cursor-pointer transition-all relative overflow-hidden group min-w-0"
                 >
                   <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-blue-600 group-hover:w-2 transition-all"></div>
                   
                   <div className="flex justify-between items-start mb-3 min-w-0">
                     <h4 className="text-emerald-400 font-bold text-base sm:text-lg break-words line-clamp-1 min-w-0 pr-2">{order.customerName}</h4>
                     <span className="shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold tracking-wider">
                       #{order.id.slice(-5).toUpperCase()}
                     </span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {showCompletedOrdersManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCompletedOrdersManager(false)}></div>

          <div
            className="relative w-full max-w-6xl bg-[#0c0c11] border border-blue-500/40 p-4 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowCompletedOrdersManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl sm:text-2xl"></i>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-neutral-800 pb-4 gap-4 pr-8 sm:pr-0">
               <h3 className="text-lg sm:text-2xl font-bold text-blue-400 flex items-center gap-3">
                 <i className="fa-solid fa-check-double"></i> الطلبات المكتملة والمجهزة
               </h3>
               <button type="button" onClick={(e) => { e.preventDefault(); fetchOrders(); }} className="bg-blue-600/20 border border-blue-500/40 hover:bg-blue-500 text-blue-400 hover:text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0">
                 <i className="fa-solid fa-rotate"></i> تحديث
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               {completedOrders.length === 0 ? (
                 <div className="col-span-full text-center py-12 border border-dashed border-neutral-700 rounded-xl bg-black/20">
                    <i className="fa-solid fa-box-archive text-4xl text-neutral-600 mb-3"></i>
                    <p className="text-gray-500 font-mono text-xs sm:text-sm">لم يتم تسجيل أي طلبات مكتملة حتى الآن.</p>
                 </div>
               ) : completedOrders.map((order) => (
                 <div 
                   key={order.id} 
                   onClick={() => setSelectedOrder(order)} 
                   className="border border-neutral-800 bg-black/40 rounded-2xl p-4 sm:p-5 shadow-md hover:border-blue-500/60 hover:bg-[#14151c] cursor-pointer transition-all relative overflow-hidden group min-w-0"
                 >
                   <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 group-hover:w-2 transition-all"></div>
                   
                   <div className="flex justify-between items-start mb-3 min-w-0">
                     <h4 className="text-blue-400 font-bold text-base sm:text-lg break-words line-clamp-1 min-w-0 pr-2">{order.customerName}</h4>
                     <span className="shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold tracking-wider">
                       #{order.id.slice(-5).toUpperCase()}
                     </span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-2 sm:p-4 transition-all">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
          
          <style>{`
             .order-scrollbar::-webkit-scrollbar { width: 6px; }
             .order-scrollbar::-webkit-scrollbar-track { background: rgba(16, 185, 129, 0.05); border-radius: 10px; }
             .order-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.5); border-radius: 10px; }
             .order-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.8); }
          `}</style>
          
          <div className={`relative bg-[#0b101a] border ${selectedOrder.status === 'completed' ? 'border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)]' : 'border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)]'} rounded-[1.5rem] w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden transform transition-all`}>
             
             {/* Header */}
             <div className={`flex justify-between items-center p-3 sm:p-5 border-b bg-gradient-to-r shrink-0 ${selectedOrder.status === 'completed' ? 'border-blue-500/10 from-blue-900/20 to-transparent' : 'border-emerald-500/10 from-emerald-900/20 to-transparent'}`}>
                <div>
                   <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedOrder.status === 'completed' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                         <i className={`fa-solid ${selectedOrder.status === 'completed' ? 'fa-check-double' : 'fa-file-invoice-dollar'}`}></i>
                      </div>
                      تفاصيل الطلب {selectedOrder.status === 'completed' ? '(مكتمل)' : ''}
                   </h3>
                   <span className={`${selectedOrder.status === 'completed' ? 'text-blue-400' : 'text-emerald-400'} font-mono text-xs mt-1 block font-bold tracking-widest`}>
                      #ORDER-{selectedOrder.id?.slice(-6).toUpperCase()}
                   </span>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-black/40 border border-neutral-700 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center shrink-0">
                   <i className="fa-solid fa-xmark text-sm"></i>
                </button>
             </div>
             
             <div className="flex flex-col lg:flex-row flex-grow overflow-y-auto lg:overflow-hidden order-scrollbar">
                
                <div className={`w-full lg:w-2/5 flex flex-col bg-[#0d131f] border-b lg:border-b-0 lg:border-l p-4 sm:p-5 lg:overflow-y-auto order-scrollbar shrink-0 ${selectedOrder.status === 'completed' ? 'border-blue-500/10' : 'border-emerald-500/10'}`}>
                   
                   <div className="mb-5">
                      <h4 className={`${selectedOrder.status === 'completed' ? 'text-blue-400' : 'text-emerald-400'} font-bold mb-3 flex items-center gap-2 text-xs`}>
                         <i className="fa-solid fa-id-card"></i> بيانات الزبون
                      </h4>
                      <div className="space-y-2.5">
                         <div className={`bg-[#111827] p-3 rounded-xl border border-neutral-800 flex items-center gap-3 transition-colors ${selectedOrder.status === 'completed' ? 'hover:border-blue-500/30' : 'hover:border-emerald-500/30'}`}>
                            <div className="bg-blue-500/10 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"><i className="fa-solid fa-user"></i></div>
                            <div className="min-w-0 flex-grow">
                               <p className="text-gray-500 text-[10px] font-mono mb-0.5">اسم المستلم</p>
                               <p className="text-white font-bold text-xs truncate">{selectedOrder.customerName}</p>
                            </div>
                         </div>
                         
                         <div className={`bg-[#111827] p-3 rounded-xl border border-neutral-800 flex items-center gap-3 transition-colors ${selectedOrder.status === 'completed' ? 'hover:border-blue-500/30' : 'hover:border-emerald-500/30'}`}>
                            <div className="bg-green-500/10 text-green-400 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"><i className="fa-solid fa-phone"></i></div>
                            <div className="min-w-0 flex-grow">
                               <p className="text-gray-500 text-[10px] font-mono mb-0.5">أرقام الهواتف</p>
                               <a href={`tel:${selectedOrder.customerPhone}`} className={`text-white font-bold text-xs transition-colors truncate block ${selectedOrder.status === 'completed' ? 'hover:text-blue-400' : 'hover:text-emerald-400'}`} dir="ltr">{selectedOrder.customerPhone}</a>
                               {selectedOrder.customerPhone2 && (
                                  <a href={`tel:${selectedOrder.customerPhone2}`} className={`text-gray-300 font-bold text-[11px] transition-colors truncate block mt-1 ${selectedOrder.status === 'completed' ? 'hover:text-blue-400' : 'hover:text-emerald-400'}`} dir="ltr">{selectedOrder.customerPhone2} (إضافي)</a>
                               )}
                            </div>
                         </div>
                         
                         <div className={`bg-[#111827] p-3 rounded-xl border border-neutral-800 flex items-start gap-3 transition-colors ${selectedOrder.status === 'completed' ? 'hover:border-blue-500/30' : 'hover:border-emerald-500/30'}`}>
                            <div className="bg-orange-500/10 text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm mt-0.5"><i className="fa-solid fa-map-location-dot"></i></div>
                            <div className="min-w-0 flex-grow">
                               <p className="text-gray-500 text-[10px] font-mono mb-0.5">الموقع المختار والتفاصيل</p>
                               <p className="text-white font-bold text-xs leading-relaxed">{selectedOrder.location}</p>
                            </div>
                         </div>
                         
                         <div className={`bg-[#111827] p-3 rounded-xl border border-neutral-800 flex items-center gap-3 transition-colors ${selectedOrder.status === 'completed' ? 'hover:border-blue-500/30' : 'hover:border-emerald-500/30'}`}>
                            <div className="bg-purple-500/10 text-purple-400 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"><i className="fa-solid fa-clock"></i></div>
                            <div className="min-w-0 flex-grow">
                               <p className="text-gray-500 text-[10px] font-mono mb-0.5">تاريخ ووقت الطلب</p>
                               <p className="text-white font-bold text-[11px] truncate">{new Date(selectedOrder.timestamp).toLocaleString('ar-IQ')}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-auto">
                      <h4 className={`${selectedOrder.status === 'completed' ? 'text-blue-400' : 'text-emerald-400'} font-bold mb-3 flex items-center gap-2 text-xs`}>
                         <i className="fa-solid fa-calculator"></i> الحساب الختامي
                      </h4>
                      <div className={`bg-[#0a0f18] p-4 rounded-2xl border shadow-inner relative overflow-hidden ${selectedOrder.status === 'completed' ? 'border-blue-500/20' : 'border-emerald-500/20'}`}>
                         <div className="absolute -left-10 -bottom-10 opacity-5 pointer-events-none">
                            <i className="fa-solid fa-receipt text-[100px]"></i>
                         </div>
                         
                         <div className="relative z-10 space-y-2.5">
                            {selectedOrder.subtotalAmount !== undefined && (
                               <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
                                  <span>المجموع الفرعي:</span>
                                  <span className="font-mono text-white">{selectedOrder.subtotalAmount?.toLocaleString()} د.ع</span>
                               </div>
                            )}
                            
                            {selectedOrder.deliveryFee !== undefined && (
                               <div className="flex justify-between items-center text-gray-400 text-xs font-bold pb-3 border-b border-neutral-800/80">
                                  <span className="truncate pr-2">نقل ({selectedOrder.governorate || 'محدد'}):</span>
                                  <span className="font-mono text-white whitespace-nowrap">{selectedOrder.deliveryFee?.toLocaleString()} د.ع</span>
                               </div>
                            )}

                            <div className="flex justify-between items-end pt-1">
                               <span className="text-white font-black text-sm">الإجمالي المكتمل:</span>
                               <span className={`${selectedOrder.status === 'completed' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'} font-black text-lg sm:text-2xl font-mono tracking-tight whitespace-nowrap`}>
                                  {selectedOrder.totalAmount?.toLocaleString()} <span className={`text-[10px] sm:text-xs ${selectedOrder.status === 'completed' ? 'text-blue-500' : 'text-emerald-500'}`}>د.ع</span>
                               </span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="w-full lg:w-3/5 flex flex-col bg-[#0b101a] p-4 sm:p-5 lg:overflow-hidden">
                   <h4 className={`${selectedOrder.status === 'completed' ? 'text-blue-400' : 'text-emerald-400'} font-bold mb-3 flex items-center gap-2 text-xs shrink-0`}>
                      <i className="fa-solid fa-box-open"></i> المنتجات المطلوبة ({selectedOrder.items?.length || 0})
                   </h4>
                   
                   <div className="lg:overflow-y-auto order-scrollbar pr-2 space-y-2.5 flex-grow h-auto lg:h-full">
                      {(selectedOrder.items || []).map((item, idx) => (
                         <div key={idx} className={`group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#111827] p-2.5 sm:p-3 rounded-xl border border-neutral-800 transition-all gap-3 shadow-sm ${selectedOrder.status === 'completed' ? 'hover:border-blue-500/40' : 'hover:border-emerald-500/40'}`}>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                               <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-neutral-200 shadow-inner">
                                  <img src={item.image} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                               </div>
                               <div className="flex-grow min-w-0">
                                  <div className="text-white text-xs sm:text-sm font-bold line-clamp-2 leading-snug mb-1.5">{item.name}</div>
                                  
                                  <div className="text-gray-400 text-[10px] sm:text-xs font-mono bg-black/40 inline-flex items-center gap-2 px-2 py-1 rounded border border-neutral-800 mt-1">
                                    <span>{item.price?.toLocaleString()} د.ع</span>
                                    <span className={selectedOrder.status === 'completed' ? 'text-blue-500' : 'text-emerald-500'}>×</span> 
                                    <span className={`text-white text-xl sm:text-2xl font-black px-3 py-0.5 rounded-lg border shadow-sm ${selectedOrder.status === 'completed' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
                                       {item.qty}
                                    </span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className={`${selectedOrder.status === 'completed' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'} font-bold font-mono text-sm sm:text-base px-3 py-1.5 rounded-lg border w-full sm:w-auto text-center shrink-0 shadow-sm flex flex-col`}>
                               <span className={`text-[9px] ${selectedOrder.status === 'completed' ? 'text-blue-600' : 'text-emerald-600'} font-sans mb-0.5 uppercase tracking-widest block sm:hidden`}>المجموع الفرعي:</span>
                               {(item.price * item.qty).toLocaleString()} د.ع
                            </div>

                         </div>
                      ))}
                   </div>
                </div>

             </div>

             <div className={`p-3 sm:p-4 border-t bg-[#0c111a] shrink-0 flex flex-col sm:flex-row gap-3 ${selectedOrder.status === 'completed' ? 'border-blue-500/10' : 'border-emerald-500/10'}`}>
                {selectedOrder.status === 'completed' ? (
                    <button onClick={() => { handleDeleteOrder(selectedOrder.id); setSelectedOrder(null); }} className="w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-white transition-all bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 text-xs sm:text-sm">
                       <i className="fa-solid fa-trash-can text-lg"></i> حذف الطلب نهائياً
                    </button>
                ) : (
                    <>
                    <button onClick={() => confirmAndCompleteOrder(selectedOrder)} className="w-full sm:w-1/2 py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-white transition-all bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 text-xs sm:text-sm">
                       <i className="fa-solid fa-clipboard-check text-lg"></i> تأكيد إنجاز الطلب (حفظ في المكتملة)
                    </button>
                    <button onClick={() => { handleCancelOrder(selectedOrder); setSelectedOrder(null); }} className="w-full sm:w-1/2 py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-white transition-all bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 text-xs sm:text-sm">
                       <i className="fa-solid fa-ban text-lg"></i> إلغاء الطلب (إرجاع المخزون)
                    </button>
                    </>
                )}
             </div>

          </div>
        </div>
      )}

      {showProjectsManager && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 transition-opacity">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowProjectsManager(false)}></div>
            <div className="relative w-full max-w-5xl bg-[#0c0c11] border border-blue-500/40 p-4 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar" onClick={(e) => e.stopPropagation()}>
               <button type="button" onClick={() => setShowProjectsManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                  <i className="fa-solid fa-xmark text-xl sm:text-2xl"></i>
               </button>
               <h3 className="text-lg sm:text-2xl font-bold text-blue-400 flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
                 <i className="fa-solid fa-diagram-project"></i> إدارة معرض المشاريع
               </h3>

               <form onSubmit={handleAddProject} className="bg-black/40 border border-neutral-800 p-4 sm:p-6 rounded-2xl mb-8 shadow-inner">
                  <h4 className="font-bold text-white text-sm mb-4">إضافة مشروع جديد</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <input type="text" placeholder="اسم المشروع" value={newProjName} onChange={(e) => setNewProjName(e.target.value)} className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" required />
                      <input type="text" placeholder="تصنيف المشروع (مثال: إنترنت الأشياء)" value={newProjCat} onChange={(e) => setNewProjCat(e.target.value)} className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                      <textarea placeholder="وصف المشروع والتفاصيل الهندسية..." value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]" required></textarea>
                    </div>
                    
                    <div className="space-y-4 bg-neutral-900/50 p-4 rounded-xl border border-blue-500/20">
                      <label className="text-xs font-mono font-bold text-blue-400 block">// إدراج صورة الواجهة للمشروع (URL)</label>
                      <input type="url" dir="ltr" placeholder="https://..." value={newProjImg} onChange={(e) => setNewProjImg(e.target.value)} className="w-full p-3 bg-black/60 border border-neutral-700 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                      
                      <div className="w-full h-32 bg-black border border-neutral-700 rounded-xl overflow-hidden flex items-center justify-center relative">
                        {newProjImg ? (
                           <img src={newProjImg} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-xs text-neutral-600 font-mono flex flex-col items-center gap-2"><i className="fa-solid fa-image text-2xl"></i> معاينة الصورة</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-neutral-900/50 p-4 rounded-xl border border-blue-500/20 mt-2">
                        <label className="text-xs font-mono font-bold text-blue-400 block mb-3">
                            // معرض صور المشروع المرفقة (الحد الأقصى 30 صورة) | مضافة: {newProjImages.length}
                        </label>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {newProjImages.map((imgUrl, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    type="url" 
                                    dir="ltr" 
                                    placeholder={`رابط الصورة الإضافية ${idx + 1}`} 
                                    value={imgUrl} 
                                    onChange={(e) => {
                                        const updated = [...newProjImages];
                                        updated[idx] = e.target.value;
                                        setNewProjImages(updated);
                                    }} 
                                    className="w-full p-2.5 bg-black/60 border border-neutral-700 text-white rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors" 
                                />
                                <button type="button" onClick={() => setNewProjImages(newProjImages.filter((_, i) => i !== idx))} className="p-2.5 shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors border border-red-500/20">
                                <i className="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                            ))}
                        </div>
                        {newProjImages.length < 30 && (
                            <button type="button" onClick={() => setNewProjImages([...newProjImages, ''])} className="w-full py-2.5 mt-3 border border-dashed border-blue-500/40 text-blue-400 hover:bg-blue-500/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                            <i className="fa-solid fa-images"></i> إدراج مسار صورة أخرى للمشروع
                            </button>
                        )}
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                    <i className="fa-solid fa-plus text-lg"></i> حفظ المشروع في المعرض
                  </button>
               </form>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {projectsList.map((proj) => (
                    <div key={proj.id} className="bg-black/40 border border-neutral-800 rounded-xl p-4 flex flex-col hover:border-blue-500/40 transition-colors">
                       <h5 className="font-bold text-white text-sm mb-1">{proj.name}</h5>
                       <span className="text-[10px] text-blue-400 font-mono mb-2">{proj.category}</span>
                       <div className="text-xs text-gray-500 mb-3"><i className="fa-solid fa-images"></i> {(proj.images?.length || 0) + (proj.img ? 1 : 0)} صورة </div>
                       <button type="button" onClick={() => handleDeleteProject(proj.id)} className="mt-auto py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition-all w-full">
                          حذف المشروع
                       </button>
                    </div>
                 ))}
               </div>
            </div>
          </div>
      )}

    </div>
  );
}