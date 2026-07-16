import React, { useState } from 'react';
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
  
  newProdCategory, setNewProdCategory,
  categories, handleAddCategory, handleDeleteCategory, handleEditCategory,
  
  newProdChip, setNewProdChip,
  newProdCode, setNewProdCode,
  
  newProdCompatLink, setNewProdCompatLink,
  newProdLibLink, setNewProdLibLink,
  newProdCodeSnippet, setNewProdCodeSnippet,
  
  projectsList, setProjectsList,
  
  externalLinks, setExternalLinks,

  editProdId,
  orders, fetchOrders,
  handleDeleteOrder,
  visitorCount,
  
  deliveryLocations, setDeliveryLocations
}) {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrdersManager, setShowOrdersManager] = useState(false);
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

  const [showLinksManager, setShowLinksManager] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const confirmAndDeleteOrder = (orderId) => {
    if(window.confirm("هل أنت متأكد من إنهاء وحذف هذا الطلب بشكل نهائي بعد التجهيز؟")) {
      handleDeleteOrder(orderId);
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
    try {
        const payload = { name: newProjName, desc: newProjDesc, category: newProjCat };
        const docRef = await addDoc(collection(db, "projects"), payload);
        setProjectsList([...projectsList, { id: docRef.id, ...payload }]);
        setNewProjName('');
        setNewProjDesc('');
        setNewProjCat('');
        alert("تمت إضافة المشروع بنجاح!");
    } catch (err) {
        alert("فشل إضافة المشروع.");
    }
  };

  const handleDeleteProject = async (id) => {
      if(window.confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24 font-sans relative w-full">
      
      {/* الهيدر المصغر */}
      <div className="mb-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-teal-500/20">
        <div>
          <span className="font-mono text-[10px] font-bold text-teal-500 animate-pulse">// SECURE_ADMIN_CORE_v5.0</span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1 text-transparent bg-clip-text bg-gradient-to-l from-teal-400 to-blue-500">
            لوحة الإدارة
          </h2>
          <p className="max-w-md text-xs font-mono text-gray-500 mt-1">
            [ الصلاحيات نشطة: التحكم بالمنتجات، الروابط، المشاريع، والطلبات ]
          </p>
        </div>
      </div>

      {/* الأزرار العلوية والإحصائيات بحجم صغير وبجوار بعضها */}
      <div className="flex flex-wrap items-center gap-3 mb-8 w-full">
         <div className="bg-[#030212] border border-teal-500/30 px-3 py-2 rounded-xl flex items-center gap-3 shadow-lg shrink-0">
            <i className="fa-solid fa-chart-pie text-teal-400 text-sm"></i>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-400 font-mono">الزيارات:</span>
               <span className="text-sm font-black text-white" dir="ltr">{visitorCount}</span>
            </div>
         </div>
         
         <button onClick={() => { setShowOrdersManager(true); fetchOrders(); }} className="bg-[#030212] border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-boxes-packing"></i> طلبات الزبائن
         </button>

         <button onClick={() => setShowLinksManager(true)} className="bg-[#030212] border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-link"></i> إدارة الروابط
         </button>
         
         <button onClick={() => setShowProjectsManager(true)} className="bg-[#030212] border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-diagram-project"></i> المشاريع
         </button>
         
         <button onClick={() => setShowDeliveryManager(true)} className="bg-[#030212] border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all text-[11px] shrink-0">
            <i className="fa-solid fa-map-location-dot"></i> التوصيل
         </button>
      </div>

      {/* القسم الرئيسي: نموذج الإضافة العرضي ثم الكتالوج */}
      <div className="space-y-8 w-full">
         
         {/* قسم الإضافة بالعرض الأفقي */}
         <div className={`border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl transition-all w-full ${editProdId ? 'border-orange-500/50 bg-orange-900/10' : 'border-teal-500/20 bg-[#030212]'}`}>
           <h3 className="text-base sm:text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 border-b border-neutral-800 pb-3">
             <i className={`fa-solid ${editProdId ? 'fa-pen-to-square text-orange-500' : 'fa-square-plus text-teal-500'}`}></i> 
             {editProdId ? 'تعديل بيانات القطعة' : 'إضافة قطعة إلكترونية جديدة'}
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* العمود الأول: المعلومات الأساسية */}
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

             {/* العمود الثاني: الوسائط والوصف */}
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

             {/* العمود الثالث: الإضافات البرمجية وزر الحفظ */}
             <div className="space-y-4 flex flex-col justify-between">
                <div className="bg-teal-900/10 p-3 sm:p-4 border border-teal-500/20 rounded-xl space-y-4 flex-grow">
                   <h4 className="text-teal-400 font-bold text-xs sm:text-sm border-b border-teal-500/20 pb-2"><i className="fa-solid fa-code-branch"></i> المرفقات والبرمجيات</h4>
                   
                   <div>
                     <label className="text-[9px] sm:text-[10px] font-mono text-gray-400 block mb-1">Code Snippet</label>
                     <textarea dir="ltr" placeholder="void setup() { ... }" value={newProdCodeSnippet || ''} onChange={(e) => setNewProdCodeSnippet(e.target.value)} className="w-full p-2 sm:p-3 font-mono bg-black/60 border border-neutral-700 text-teal-300 rounded-xl text-[10px] sm:text-xs focus:outline-none focus:border-teal-500 transition-colors shadow-inner min-h-[70px]" rows="3"></textarea>
                   </div>
                   
                   <div>
                     <label className="text-[9px] sm:text-[10px] font-mono text-gray-400 block mb-1">رابط مادة تتوافق معه</label>
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

         {/* قسم الكتالوج الحالي أسفل الإضافة */}
         <div className="border border-neutral-800 rounded-2xl p-4 sm:p-6 bg-[#030212] shadow-xl overflow-hidden w-full">
           <h3 className="text-base sm:text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 border-b border-neutral-800 pb-3">
             <i className="fa-solid fa-list-check text-teal-500"></i> الكتالوج الحالي ({products.length} قطع)
           </h3>
           <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-right border-collapse min-w-[600px]">
               <thead>
                 <tr className="border-b border-neutral-800 text-xs font-mono text-gray-500">
                   <th className="pb-3 text-center w-16">الصورة</th>
                   <th className="pb-3 pr-4">اسم القطعة والتفاصيل</th>
                   <th className="pb-3 text-center">السعر</th>
                   <th className="pb-3 text-center">المخزون</th>
                   <th className="pb-3 text-center w-32">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-neutral-800/60 text-sm">
                 {products.map((prod) => (
                   <tr key={prod.id} className="hover:bg-neutral-900/50 transition-colors">
                     <td className="py-3 sm:py-4 text-center relative">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg p-1 border border-neutral-700 flex items-center justify-center mx-auto relative overflow-hidden shrink-0">
                         <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} alt="" className="object-contain max-h-full max-w-full" />
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
                          {(prod.compatLink || prod.libLink || prod.codeSnippet) && (
                             <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono whitespace-nowrap" title="يحتوي على ملحقات وبرمجيات"><i className="fa-solid fa-paperclip"></i> مدعوم</span>
                          )}
                       </div>
                     </td>
                     <td className="py-3 sm:py-4 text-center font-mono font-bold text-teal-400 whitespace-nowrap text-xs sm:text-sm">{prod.price.toLocaleString()} د.ع</td>
                     <td className="py-3 sm:py-4 text-center font-mono font-bold whitespace-nowrap text-xs sm:text-sm">
                        {(parseInt(prod.stock)||0) <= 0 ? <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">نافذ (0)</span> : <span className="text-orange-400">{prod.stock}</span>}
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

      {/* نافذة إدارة الطلبات المجمعة المنبثقة */}
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
                 <i className="fa-solid fa-boxes-packing"></i> طلبات الزبائن قيد التجهيز
               </h3>
               <button type="button" onClick={(e) => { e.preventDefault(); fetchOrders(); }} className="bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-500 text-emerald-400 hover:text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0">
                 <i className="fa-solid fa-rotate"></i> تحديث
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               {orders.length === 0 ? (
                 <div className="col-span-full text-center py-12 border border-dashed border-neutral-700 rounded-xl bg-black/20">
                    <i className="fa-solid fa-inbox text-4xl text-neutral-600 mb-3"></i>
                    <p className="text-gray-500 font-mono text-xs sm:text-sm">لا توجد طلبات جديدة مسجلة في قاعدة البيانات حالياً.</p>
                 </div>
               ) : orders.map((order) => (
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
    </div>
  );
}