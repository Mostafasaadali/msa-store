import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore'; 
import { db } from './firebase';

const AdminPanel = ({
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
}) => {

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
                         <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} alt="" loading="lazy" className="object-contain max-h-full max-w-full" />
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
                   <p className="text-gray-400 text-[10px] sm:text-xs mb-4 line-clamp-1"><i className="fa-solid fa-location-dot"></i> {order.location}</p>
                   
                   <div className="flex justify-between items-end border-t border-neutral-800 pt-3">
                      <span className="text-gray-500 text-[10px] sm:text-xs bg-neutral-900 px-2 py-1 rounded font-mono">المواد: {order.items?.length || 0}</span>
                      <p className="text-white font-bold font-mono text-xs sm:text-sm">{order.totalAmount?.toLocaleString()} د.ع</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* نوافذ عرض الفاتورة للإدارة */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-2 sm:p-6 transition-opacity duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-[#0a0a0f] border border-emerald-500/40">
            
            <div className="bg-[#12131a] border-b border-emerald-500/30 px-4 sm:px-10 py-3 sm:py-4 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
                     <i className="fa-solid fa-file-invoice text-base sm:text-xl text-black"></i>
                  </div>
                  <div>
                     <h2 className="text-sm sm:text-2xl font-black text-white tracking-wide truncate">فاتورة التجهيز الرسمية</h2>
                  </div>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="w-7 h-7 rounded-full flex items-center justify-center bg-black/60 border border-neutral-600 text-gray-300 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-md shrink-0 ml-2">
                  <i className="fa-solid fa-xmark text-sm sm:text-lg"></i>
               </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
               
               <div className="w-full lg:w-1/3 bg-[#0d0e14] border-b lg:border-b-0 lg:border-l border-neutral-800 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar shrink-0 max-h-[40vh] lg:max-h-full">
                  <div>
                     <h3 className="text-base sm:text-lg font-black text-emerald-400 mb-3 flex items-center gap-2 sm:gap-3 border-b border-neutral-800 pb-2 sm:pb-3">
                        <i className="fa-solid fa-address-card"></i> بيانات المستلم
                     </h3>
                     
                     <div className="space-y-2 sm:space-y-3">
                        <div className="bg-[#161821] p-3 rounded-2xl sm:rounded-3xl border border-neutral-800 shadow-sm">
                           <p className="text-xs sm:text-sm text-gray-200 font-mono mb-1 sm:mb-2">// اسم الزبون</p>
                           <p className="text-base sm:text-xl font-bold text-white break-words">{selectedOrder.customerName}</p>
                        </div>
                        <div className="bg-[#161821] p-3 rounded-2xl border border-neutral-800 shadow-sm">
                           <p className="text-xs sm:text-sm text-gray-200 font-mono mb-1 sm:mb-2">// رقم الهاتف</p>
                           <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><i className="fa-solid fa-phone"></i></div>
                              <p className="text-lg sm:text-2xl font-bold text-white font-mono tracking-widest break-words" dir="ltr">{selectedOrder.customerPhone}</p>
                           </div>
                        </div>
                        <div className="bg-[#161821] p-3 rounded-2xl border border-neutral-800 shadow-sm">
                           <p className="text-xs sm:text-sm text-gray-200 font-mono mb-1 sm:mb-2">// عنوان التوصيل</p>
                           <div className="flex items-start gap-2 sm:gap-3">
                              <i className="fa-solid fa-map-location-dot text-emerald-500 mt-1 text-sm sm:text-lg shrink-0"></i>
                              <p className="text-sm sm:text-base font-bold text-gray-200 leading-relaxed break-words">{selectedOrder.location}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-800 shrink-0">
                     <button 
                       onClick={() => {
                          confirmAndDeleteOrder(selectedOrder.id);
                          if(orders.length <= 1) setShowOrdersManager(false);
                       }}
                       className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-[1.02]"
                     >
                       <i className="fa-solid fa-check-double text-lg sm:text-xl"></i> إتمام وحذف الطلب
                     </button>
                  </div>
               </div>

               <div className="w-full lg:w-2/3 p-3 sm:p-6 flex flex-col bg-black/60 overflow-hidden min-h-0">
                  <div className="flex justify-between items-center mb-3 sm:mb-6 border-b border-neutral-800 pb-2 shrink-0">
                     <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                        <i className="fa-solid fa-box-open text-emerald-500"></i> المواد المطلوبة
                     </h3>
                     <span className="bg-emerald-500 text-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full font-bold font-mono shadow-sm text-[10px] sm:text-sm">
                        الإجمالي: {selectedOrder.items?.length || 0}
                     </span>
                  </div>
                  

<div className="flex-grow overflow-y-auto pr-1 sm:pr-2 custom-scrollbar space-y-2 sm:space-y-3 mb-3 sm:mb-4">
  {selectedOrder.items?.map((item, idx) => (
    <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 bg-[#12131a] p-2 sm:p-3 rounded-xl sm:rounded-3xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-0">
      
      <div className="w-full sm:w-40 h-24 sm:h-28 bg-[#1a1c25] rounded-lg sm:rounded-2xl p-1 border border-neutral-800 flex items-center justify-center flex-shrink-0">
        <img src={item.image} alt={item.name} loading="lazy" className="object-contain max-h-full max-w-full" />
      </div>
      
      <div className="flex-grow text-center sm:text-right min-w-0 w-full">
        <p className="text-base sm:text-xl font-black text-white mb-2 sm:mb-5 truncate break-words line-clamp-2 sm:line-clamp-none whitespace-normal">{item.name}</p>
        <span className="text-emerald-400 font-mono font-bold bg-emerald-500/5 px-3 sm:px-5 py-1 rounded-md sm:rounded-lg border border-emerald-500/10 inline-block text-xs sm:text-base">
           {Number(item.price).toLocaleString()} د.ع
        </span>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-8 bg-black/40 px-4 sm:px-6 py-2 rounded-xl sm:rounded-3xl border border-neutral-800 shrink-0 w-full sm:w-auto justify-center">
         <div className="text-center">
            <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-mono">الكمية</p>
            <p className="text-base sm:text-xl font-black text-white">{item.qty}</p>
         </div>
         <div className="h-6 w-[2px] bg-neutral-800"></div>
         <div className="text-center min-w-[60px] sm:min-w-[70px]">
            <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-mono">المجموع</p>
            <p className="text-sm sm:text-base font-bold text-emerald-400">{(Number(item.price) * Number(item.qty)).toLocaleString()}</p>
         </div>
      </div>
    </div>
  ))}
</div>
                  <div className="bg-gradient-to-r from-[#12131a] to-[#0a0a0f] rounded-xl sm:rounded-3xl p-3 sm:p-5 border-2 sm:border-3 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] shrink-0">
                     <div className="flex justify-between items-center mb-2 sm:mb-3 text-gray-400 font-mono text-xs sm:text-lg">
                        <span>أسعار المواد:</span>
                        <span className="text-white">{Number(selectedOrder.subtotalAmount).toLocaleString()} د.ع</span>
                     </div>
                     <div className="flex justify-between items-center mb-2 sm:mb-4 pb-2 sm:pb-5 border-b border-neutral-700 text-gray-400 font-mono text-xs sm:text-lg">
                        <span>أجور النقل:</span>
                        <span className="text-white">{(Number(selectedOrder.deliveryFee) || 0).toLocaleString()} د.ع</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-base sm:text-xl font-black text-white tracking-wide">المبلغ الكلي:</span>
                        <span className="text-lg sm:text-2xl font-black font-mono text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                           {Number(selectedOrder.totalAmount).toLocaleString()} <span className="text-sm sm:text-2xl">د.ع</span>
                        </span>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}

      {/* نوافذ عرض وإدارة القوائم والتصنيفات */}
      {showCatManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCatManager(false)}></div>
          
          <div 
            className="relative w-full max-w-md bg-[#0c0c11] border border-teal-500/40 p-6 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowCatManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 border-b border-neutral-800 pb-4 flex items-center gap-3">
              <i className="fa-solid fa-tags text-teal-500"></i> إدارة القوائم والفئات
            </h3>

            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="اسم القائمة الجديدة..." 
                value={newCatInput} 
                onChange={e => setNewCatInput(e.target.value)} 
                className="flex-grow p-3 bg-black/60 border border-neutral-800 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 shadow-inner min-w-0" 
              />
              <button 
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  if(newCatInput.trim() !== '') {
                    handleAddCategory(newCatInput); 
                    setNewCatInput(''); 
                  }
                }} 
                className="bg-teal-600/20 text-teal-400 border border-teal-500/30 px-5 rounded-xl font-bold hover:bg-teal-500 hover:text-black transition-all text-sm shrink-0"
              >
                إضافة
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {(categories || []).map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-neutral-900/40 p-4 rounded-xl border border-neutral-800 transition-colors hover:border-teal-500/20 min-w-0">
                  
                  {editCatId === cat.id ? (
                    <div className="flex gap-2 w-full items-center min-w-0">
                      <input 
                        type="text" 
                        value={editCatInput} 
                        onChange={e => setEditCatInput(e.target.value)} 
                        className="flex-grow min-w-0 p-2 bg-black border border-teal-500/50 text-white rounded-lg text-sm outline-none shadow-inner" 
                      />
                      <button type="button" onClick={(e) => { e.preventDefault(); handleEditCategory(cat.id, cat.name, editCatInput); setEditCatId(null); }} className="text-teal-400 hover:text-teal-300 font-bold text-sm bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/30 shrink-0">حفظ</button>
                      <button type="button" onClick={(e) => { e.preventDefault(); setEditCatId(null); }} className="text-gray-400 hover:text-white text-sm bg-neutral-800 px-3 py-1.5 rounded-lg shrink-0">إلغاء</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-200 font-bold text-sm flex items-center gap-2 truncate">
                        <i className="fa-solid fa-tag text-neutral-600 text-xs shrink-0"></i> <span className="truncate">{cat.name}</span>
                      </span>
                      <div className="flex gap-2 shrink-0 ml-2">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setEditCatId(cat.id); setEditCatInput(cat.name); }} 
                          className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-black transition-colors flex items-center justify-center"
                          title="تغيير الاسم"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); if(window.confirm('هل أنت متأكد من حذف هذه القائمة نهائياً؟')) handleDeleteCategory(cat.id, cat.name); }} 
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center"
                          title="حذف القائمة"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {(!categories || categories.length === 0) && (
                <div className="text-center py-8">
                  <i className="fa-solid fa-folder-open text-3xl text-neutral-700 mb-2"></i>
                  <p className="text-gray-500 text-sm">لا توجد قوائم حالياً.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeliveryManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDeliveryManager(false)}></div>

          <div
            className="relative w-full max-w-4xl bg-[#0c0c11] border border-teal-500/40 p-4 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowDeliveryManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>

            <h3 className="text-xl sm:text-2xl font-bold text-teal-400 mb-6 flex items-center gap-3 border-b border-neutral-800 pb-4">
               <i className="fa-solid fa-truck-fast"></i> مناطق وأسعار التوصيل
            </h3>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
               <div className="w-full md:w-1/3 bg-[#12131a] p-5 sm:p-6 rounded-2xl border border-teal-500/20 shadow-inner h-fit shrink-0">
                  <h4 className="text-lg font-bold text-white mb-5">إضافة محافظة</h4>
                  <div className="space-y-4">
                     <input type="text" placeholder="اسم المحافظة (مثال: بغداد)" value={newGovName} onChange={e => setNewGovName(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-teal-500 outline-none transition-all" />
                     <input type="number" placeholder="سعر التوصيل (مثال: 5000)" value={newGovPrice} onChange={e => setNewGovPrice(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-teal-500 outline-none transition-all" />
                     <input type="text" placeholder="الوقت المتوقع (مثال: 2-3 أيام)" value={newGovTime} onChange={e => setNewGovTime(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-teal-500 outline-none transition-all" />
                     <button onClick={handleAddDeliveryLocation} className="w-full py-3 mt-2 bg-teal-500 text-black rounded-xl text-sm font-bold hover:bg-teal-400 transition-all shadow-md">
                        <i className="fa-solid fa-plus"></i> إضافة للقائمة
                     </button>
                  </div>
               </div>

               <div className="w-full md:w-2/3 bg-[#12131a] p-5 sm:p-6 rounded-2xl border border-teal-500/20 flex flex-col min-w-0">
                  <h4 className="text-lg font-bold text-white mb-5 flex justify-between items-center shrink-0">
                     <span>المحافظات المسجلة</span>
                     <span className="text-xs bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full font-mono border border-teal-500/30">{deliveryLocations.length}</span>
                  </h4>
                  <div className="flex-grow overflow-y-auto max-h-[400px] custom-scrollbar space-y-3 pr-2 min-w-0">
                     {deliveryLocations.length === 0 ? (
                        <div className="text-center py-10">
                           <i className="fa-solid fa-map-location-dot text-4xl text-neutral-600 mb-3"></i>
                           <p className="text-gray-500 text-sm">لا توجد محافظات مضافة حالياً.</p>
                        </div>
                     ) : (
                        deliveryLocations.map(gov => (
                           <div key={gov.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-neutral-800 hover:border-teal-500/40 transition-all shadow-sm min-w-0 gap-2">
                              <div className="min-w-0">
                                 <p className="text-white font-bold text-sm sm:text-base mb-1 truncate">{gov.name}</p>
                                 <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] sm:text-xs text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 whitespace-nowrap">
                                       {Number(gov.price).toLocaleString()} د.ع
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-gray-500 font-mono whitespace-nowrap">
                                       <i className="fa-regular fa-clock"></i> {gov.time}
                                    </span>
                                 </div>
                              </div>
                              <button onClick={() => handleDeleteDeliveryLocation(gov.id)} className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20 shrink-0">
                                 <i className="fa-solid fa-trash-can"></i>
                              </button>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إدارة المشاريع */}
      {showProjectsManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowProjectsManager(false)}></div>

          <div
            className="relative w-full max-w-4xl bg-[#0c0c11] border border-blue-500/40 p-4 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowProjectsManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>

            <h3 className="text-xl sm:text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3 border-b border-neutral-800 pb-4">
               <i className="fa-solid fa-diagram-project"></i> إدارة المشاريع للتطبيق
            </h3>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
               <div className="w-full md:w-1/3 bg-[#12131a] p-5 sm:p-6 rounded-2xl border border-blue-500/20 shadow-inner h-fit shrink-0">
                  <h4 className="text-lg font-bold text-white mb-5">إضافة مشروع</h4>
                  <div className="space-y-4">
                     <input type="text" placeholder="اسم المشروع" value={newProjName} onChange={e => setNewProjName(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-blue-500 outline-none transition-all" />
                     
                     <select value={newProjCat} onChange={e => setNewProjCat(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-gray-400 rounded-xl text-sm focus:border-blue-500 outline-none transition-all">
                        <option value="">اختر التصنيف (اختياري)</option>
                        {(categories || []).map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                     </select>
                     
                     <textarea placeholder="شرح المشروع..." value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} rows="4" className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-blue-500 outline-none transition-all"></textarea>
                     
                     <button onClick={handleAddProject} className="w-full py-3 mt-2 bg-blue-500 text-black rounded-xl text-sm font-bold hover:bg-blue-400 transition-all shadow-md">
                        <i className="fa-solid fa-plus"></i> حفظ المشروع
                     </button>
                  </div>
               </div>

               <div className="w-full md:w-2/3 bg-[#12131a] p-5 sm:p-6 rounded-2xl border border-blue-500/20 flex flex-col min-w-0">
                  <h4 className="text-lg font-bold text-white mb-5 flex justify-between items-center shrink-0">
                     <span>المشاريع المرفوعة</span>
                     <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-mono border border-blue-500/30">{projectsList.length}</span>
                  </h4>
                  <div className="flex-grow overflow-y-auto max-h-[400px] custom-scrollbar space-y-3 pr-2 min-w-0">
                     {projectsList.length === 0 ? (
                        <div className="text-center py-10">
                           <i className="fa-solid fa-folder-open text-4xl text-neutral-600 mb-3"></i>
                           <p className="text-gray-500 text-sm">لا توجد مشاريع مضافة حالياً.</p>
                        </div>
                     ) : (
                        projectsList.map(proj => (
                           <div key={proj.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-neutral-800 hover:border-blue-500/40 transition-all shadow-sm min-w-0 gap-2">
                              <div className="min-w-0">
                                 <p className="text-white font-bold text-sm sm:text-base mb-1 truncate">{proj.name}</p>
                                 <p className="text-[10px] sm:text-xs text-gray-500 mb-2 truncate">{proj.desc}</p>
                                 <span className="text-[9px] sm:text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 whitespace-nowrap">
                                    {proj.category || 'غير مصنف'}
                                 </span>
                              </div>
                              <button onClick={() => handleDeleteProject(proj.id)} className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20 shrink-0">
                                 <i className="fa-solid fa-trash-can"></i>
                              </button>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إدارة الروابط الخارجية (للقائمة الجانبية) */}
      {showLinksManager && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLinksManager(false)}></div>

          <div
            className="relative w-full max-w-4xl bg-[#0c0c11] border border-purple-500/40 p-4 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowLinksManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>

            <h3 className="text-xl sm:text-2xl font-bold text-purple-400 mb-6 flex items-center gap-3 border-b border-neutral-800 pb-4">
               <i className="fa-solid fa-link"></i> إدارة روابط القائمة الجانبية
            </h3>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
               <div className="w-full md:w-1/3 bg-[#12131a] p-5 sm:p-6 rounded-2xl border border-purple-500/20 shadow-inner h-fit shrink-0">
                  <h4 className="text-lg font-bold text-white mb-5">إضافة رابط للزوار</h4>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-mono text-gray-400 block mb-1">اسم الزر (مثال: قناة اليوتيوب)</label>
                        <input type="text" placeholder="العنوان" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-purple-500 outline-none transition-all" />
                     </div>
                     <div>
                        <label className="text-xs font-mono text-gray-400 block mb-1">المسار (URL)</label>
                        <input type="text" dir="ltr" placeholder="https://..." value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-purple-300 rounded-xl text-sm focus:border-purple-500 outline-none transition-all" />
                     </div>
                     
                     <button onClick={handleAddExternalLink} className="w-full py-3 mt-2 bg-purple-500 text-black rounded-xl text-sm font-bold hover:bg-purple-400 transition-all shadow-md">
                        <i className="fa-solid fa-plus"></i> إضافة الرابط
                     </button>
                  </div>
               </div>

               <div className="w-full md:w-2/3 bg-[#12131a] p-5 sm:p-6 rounded-2xl border border-purple-500/20 flex flex-col min-w-0">
                  <h4 className="text-lg font-bold text-white mb-5 flex justify-between items-center shrink-0">
                     <span>الروابط الحالية</span>
                     <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-mono border border-purple-500/30">{externalLinks.length}</span>
                  </h4>
                  <div className="flex-grow overflow-y-auto max-h-[400px] custom-scrollbar space-y-3 pr-2 min-w-0">
                     {externalLinks.length === 0 ? (
                        <div className="text-center py-10">
                           <i className="fa-solid fa-globe text-4xl text-neutral-600 mb-3"></i>
                           <p className="text-gray-500 text-sm">لا توجد روابط مضافة.</p>
                        </div>
                     ) : (
                        externalLinks.map(link => (
                           <div key={link.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-neutral-800 hover:border-purple-500/40 transition-all shadow-sm min-w-0 gap-2">
                              <div className="min-w-0">
                                 <p className="text-white font-bold text-sm mb-1 truncate"><i className="fa-solid fa-arrow-up-right-from-square text-purple-500 ml-1"></i> {link.title}</p>
                                 <p className="text-[10px] sm:text-xs text-gray-500 font-mono truncate" dir="ltr">{link.url}</p>
                              </div>
                              <button onClick={() => handleDeleteExternalLink(link.id)} className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20 shrink-0">
                                 <i className="fa-solid fa-trash-can"></i>
                              </button>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(AdminPanel);
