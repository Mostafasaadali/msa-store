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
  
  editProdId,
  orders, fetchOrders,
  handleDeleteOrder,
  visitorCount,
  
  deliveryLocations, setDeliveryLocations
}) {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [editCatId, setEditCatId] = useState(null);
  const [editCatInput, setEditCatInput] = useState('');

  const [showDeliveryManager, setShowDeliveryManager] = useState(false);
  const [newGovName, setNewGovName] = useState('');
  const [newGovPrice, setNewGovPrice] = useState('');
  const [newGovTime, setNewGovTime] = useState('');

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

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 font-sans relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-teal-500/20 pb-8 gap-6">
        <div>
          <span className="font-mono text-xs font-bold text-teal-500 animate-pulse">// SECURE_ADMIN_CORE_v2.5</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-2 text-transparent bg-clip-text bg-gradient-to-l from-teal-400 to-blue-500">
            لوحة الإدارة المتقدمة
          </h2>
          <p className="max-w-sm text-sm font-mono text-gray-500 mt-2">
            [ الصلاحيات نشطة: التحكم بالمنتجات، التوصيل، الطلبات، وإعدادات النظام ]
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
           <button 
             onClick={() => setShowDeliveryManager(true)} 
             className="bg-[#030212] border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg font-bold transition-all"
           >
              <i className="fa-solid fa-map-location-dot text-2xl"></i> إدارة مناطق التوصيل
           </button>

           <div className="bg-[#030212] border border-teal-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg min-w-[180px]">
              <div className="bg-teal-500/10 p-3 rounded-xl border border-teal-500/20">
                 <i className="fa-solid fa-chart-pie text-2xl text-teal-400"></i>
              </div>
              <div>
                 <p className="text-xs text-gray-400 font-mono mb-1">زيارات الموقع</p>
                 <p className="text-3xl font-black text-white" dir="ltr">{visitorCount}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
        <div className={`lg:col-span-1 border rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all ${editProdId ? 'border-orange-500/50 bg-orange-900/10' : 'border-teal-500/20 bg-[#030212]'}`}>
          <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 border-b border-neutral-800 pb-3">
            <i className={`fa-solid ${editProdId ? 'fa-pen-to-square text-orange-500' : 'fa-square-plus text-teal-500'}`}></i> 
            {editProdId ? 'تعديل بيانات القطعة' : 'إضافة قطعة إلكترونية جديدة'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_NAME</label>
              <input type="text" placeholder="اسم المنتج" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
            </div>
            
            <div>
              <label className="text-xs font-mono font-bold text-teal-400 block mb-2">// PROD_CATEGORY (اختر فئة)</label>
              <div className="flex gap-2">
                <select 
                  value={newProdCategory} 
                  onChange={(e) => setNewProdCategory(e.target.value)} 
                  className="w-full p-3 bg-black/40 border border-teal-500/30 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner appearance-none cursor-pointer"
                >
                  <option value="" className="bg-neutral-900 text-gray-500">-- غير محدد --</option>
                  {(categories || []).map(c => (
                    <option key={c.id} value={c.name} className="bg-neutral-900">{c.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowCatManager(true); }} 
                  className="px-4 py-3 bg-teal-600/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-black rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-inner"
                  title="إدارة القائمة"
                >
                  <i className="fa-solid fa-list"></i> إدارة القوائم
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_PRICE_IQD</label>
                <input type="number" placeholder="السعر" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="w-full p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-mono font-bold text-teal-400 block mb-2">// PROD_STOCK</label>
                <input type="number" placeholder="العدد المتوفر" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="w-full p-3 bg-black/40 border border-teal-500/30 text-teal-400 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_CHIP</label>
                <input type="text" placeholder="مثال: MCU v3" value={newProdChip} onChange={(e) => setNewProdChip(e.target.value)} className="w-full p-3 bg-black/40 border border-neutral-800 text-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_CODE</label>
                <input type="text" placeholder="مثال: ATMEGA328P" value={newProdCode} onChange={(e) => setNewProdCode(e.target.value)} className="w-full p-3 bg-black/40 border border-neutral-800 text-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_DESCRIPTION</label>
              <textarea placeholder="وصف مفصل للمنتج ومميزاته..." value={newProdDesc || ''} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" rows="3"></textarea>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-gray-400 block mb-2">// PROD_IMAGE_MAIN</label>
              <input type="text" placeholder="رابط صورة المنتج الأساسية (URL)" value={newProdImg || ''} onChange={(e) => setNewProdImg(e.target.value)} className="w-full p-3 bg-black/40 border border-neutral-800 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-inner" dir="ltr" />
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-neutral-800">
              <label className="text-xs font-mono font-bold text-teal-400 block mb-3">// PROD_GALLERY (معرض الصور: {newProdImages?.length || 0}/10)</label>
              
              {(newProdImages || []).map((imgUrl, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" placeholder={`رابط الصورة ${index + 1}`} value={imgUrl} onChange={(e) => {
                    const newImgs = [...newProdImages];
                    newImgs[index] = e.target.value;
                    setNewProdImages(newImgs);
                  }} className="w-full p-2 bg-black/60 border border-neutral-700 text-white rounded-lg text-xs focus:outline-none focus:border-teal-500 transition-colors shadow-inner" dir="ltr" />
                  <button type="button" onClick={(e) => { e.preventDefault(); setNewProdImages(newProdImages.filter((_, i) => i !== index)); }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20" title="حذف الصورة">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
              
              {(newProdImages || []).length < 10 && (
                <button type="button" onClick={(e) => { e.preventDefault(); setNewProdImages([...(newProdImages || []), '']); }} className="w-full py-2.5 mt-1 border border-dashed border-teal-500/40 text-teal-500 hover:bg-teal-500/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <i className="fa-solid fa-plus"></i> إضافة رابط صورة أخرى
                </button>
              )}
            </div>

            <button type="button" onClick={(e) => { e.preventDefault(); handleSaveProduct(); }} className={`w-full py-3.5 mt-4 rounded-xl text-white font-bold text-sm tracking-wider transition-all shadow-lg ${editProdId ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500' : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500'}`}>
              <i className="fa-solid fa-cloud-arrow-up"></i> {editProdId ? 'حفظ التعديلات' : 'إضافة القطعة للقاعدة'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 border border-neutral-800 rounded-2xl p-6 bg-[#030212] shadow-xl overflow-hidden">
          <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 border-b border-neutral-800 pb-3">
            <i className="fa-solid fa-list-check text-teal-500"></i> الكتالوج الحالي ({products.length} قطع)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-mono text-gray-500">
                  <th className="pb-3 text-center w-16">الصورة</th>
                  <th className="pb-3 pr-4">اسم القطعة والتفاصيل</th>
                  <th className="pb-3 text-center">السعر</th>
                  <th className="pb-3 text-center">المخزون</th>
                  <th className="pb-3 text-center w-40">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-4 text-center relative">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 border border-neutral-700 flex items-center justify-center mx-auto relative overflow-hidden">
                        <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} alt="" className="object-contain max-h-full max-w-full" />
                      </div>
                      {prod.images && prod.images.length > 1 && (
                        <span className="absolute -top-1 -right-1 bg-teal-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-black z-10">
                          +{prod.images.length - 1}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-gray-200 font-bold">
                      {prod.name}
                      <div className="mt-1">
                         {prod.category && <span className="mr-1 inline-block bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded text-[10px] font-mono">{prod.category}</span>}
                         {prod.code && <span className="inline-block bg-neutral-800 border border-neutral-700 text-gray-400 px-2 py-0.5 rounded text-[10px] font-mono">{prod.code}</span>}
                      </div>
                    </td>
                    <td className="py-4 text-center font-mono font-bold text-teal-400">{prod.price.toLocaleString()} د.ع</td>
                    <td className="py-4 text-center font-mono font-bold">
                       {(parseInt(prod.stock)||0) <= 0 ? <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">نافذ (0)</span> : <span className="text-orange-400">{prod.stock}</span>}
                    </td>
                    <td className="py-4 text-center flex justify-center gap-2 mt-2">
                      <button type="button" onClick={(e) => { e.preventDefault(); handleEditClick(prod); }} className="p-2 px-3 bg-orange-600/10 border border-orange-500/30 hover:bg-orange-600 hover:text-white text-orange-400 rounded-lg text-xs font-mono transition-all shadow-sm">
                        <i className="fa-solid fa-pen"></i> تعديل
                      </button>
                      <button type="button" onClick={(e) => { e.preventDefault(); handleDeleteProduct(prod.id); }} className="p-2 px-3 bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 rounded-lg text-xs font-mono transition-all shadow-sm">
                        <i className="fa-solid fa-trash-can"></i> حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border border-teal-500/20 rounded-2xl p-6 bg-[#030212] shadow-xl">
        <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <i className="fa-solid fa-boxes-packing text-teal-500 text-3xl"></i> طلبات الزبائن قيد التجهيز
            </h3>
            <p className="text-gray-400 text-sm mt-1">اضغط على الطلب لعرض الفاتورة والمواد المطلوبة بحجم كبير وواضح.</p>
          </div>
          <button type="button" onClick={(e) => { e.preventDefault(); fetchOrders(); }} className="bg-teal-600/20 border border-teal-500/40 hover:bg-teal-500 text-teal-400 hover:text-black px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2">
            <i className="fa-solid fa-rotate"></i> تحديث الطلبات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-3 text-center py-12 border border-dashed border-neutral-700 rounded-xl bg-black/20">
               <i className="fa-solid fa-inbox text-4xl text-neutral-600 mb-3"></i>
               <p className="text-gray-500 font-mono">لا توجد طلبات جديدة مسجلة في قاعدة البيانات حالياً.</p>
            </div>
          ) : orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)} 
              className="border border-neutral-800 bg-black/40 rounded-2xl p-5 shadow-md hover:border-teal-500/60 hover:bg-[#14151c] cursor-pointer transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-blue-600 group-hover:w-2 transition-all"></div>
              
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-teal-400 font-bold text-lg">{order.customerName}</h4>
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">
                  #{order.id.slice(-5).toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-4 line-clamp-1"><i className="fa-solid fa-location-dot"></i> {order.location}</p>
              
              <div className="flex justify-between items-end border-t border-neutral-800 pt-3">
                 <span className="text-gray-500 text-xs bg-neutral-900 px-2 py-1 rounded font-mono">المواد: {order.items?.length || 0}</span>
                 <p className="text-white font-bold font-mono text-sm">{order.totalAmount?.toLocaleString()} د.ع</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(20,184,166,0.15)] bg-[#0a0a0f] border border-teal-500/40">
            
            <div className="bg-[#12131a] border-b border-teal-500/30 px-10 py-4 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
                     <i className="fa-solid fa-file-invoice text-xl text-black"></i>
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-white tracking-wide">فاتورة التجهيز الرسمية</h2>

                  </div>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="w-7 h-7 rounded-full flex items-center justify-center bg-black/60 border border-neutral-600 text-gray-300 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-md">
                  <i className="fa-solid fa-xmark text-xl"></i>
               </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
               
               <div className="w-full lg:w-1/3 bg-[#0d0e14] border-l border-neutral-800 p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                  <div>
                     <h3 className="text-lg font-black text-teal-400 mb-3 flex items-center gap-3 border-b border-neutral-800 pb-3">
                        <i className="fa-solid fa-address-card"></i> بيانات المستلم
                     </h3>
                     
                     <div className="space-y-3">
                        <div className="bg-[#161821] p-3 rounded-3xl border border-neutral-800 shadow-sm">
                           <p className="text-l text-gray-200 font-mono mb-2">// اسم الزبون</p>
                           <p className="text-2xl font-bold text-white">{selectedOrder.customerName}</p>
                        </div>
                        <div className="bg-[#161821] p-3 rounded-2xl border border-neutral-800 shadow-sm">
                           <p className="text-l text-gray-200 font-mono mb-2">// رقم الهاتف</p>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500"><i className="fa-solid fa-phone"></i></div>
                              <p className="text-2xl font-bold text-white font-mono tracking-widest" dir="ltr">{selectedOrder.customerPhone}</p>
                           </div>
                        </div>
                        <div className="bg-[#161821] p-3 rounded-2xl border border-neutral-800 shadow-sm">
                           <p className="text-l text-gray-200 font-mono mb-2">// عنوان التوصيل</p>
                           <div className="flex items-start gap-3">
                              <i className="fa-solid fa-map-location-dot text-teal-500 mt-1.5 text-lg"></i>
                              <p className="text-lg font-bold text-gray-200 leading-relaxed">{selectedOrder.location}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-800">
                     <button 
                       onClick={() => confirmAndDeleteOrder(selectedOrder.id)}
                       className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-[1.02]"
                     >
                       <i className="fa-solid fa-check-double text-2xl"></i> إتمام وحذف الطلب
                     </button>
                  </div>
               </div>

               <div className="w-full lg:w-2/3 p-3 flex flex-col bg-black/60 overflow-hidden">
                  <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-2">
                     <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <i className="fa-solid fa-box-open text-teal-500"></i> المواد المطلوبة للتجهيز
                     </h3>
                     <span className="bg-teal-500 text-black px-4 py-1.5 rounded-full font-bold font-mono shadow-sm">
                        الإجمالي: {selectedOrder.items?.length || 0} مواد
                     </span>
                  </div>
                  

<div className="flex-grow overflow-y-auto pr-3 custom-scrollbar space-y-2 mb-1">
  {selectedOrder.items?.map((item, idx) => (
    <div key={idx} className="flex flex-col sm:flex-row items-center gap-6 bg-[#12131a] p-1 rounded-3xl border border-teal-500/10 hover:border-teal-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      
      {/* الصورة */}
      <div className="w-40 h-28 bg-[#1a1c25] rounded-2xl p-1 border border-neutral-800 flex items-center justify-center flex-shrink-0">
        <img src={item.image} alt={item.name} className="object-contain max-h-full max-w-full" />
      </div>
      
      {/* المعلومات */}
      <div className="flex-grow text-center sm:text-right">
        <p className="text-xl font-black text-white mb-5">{item.name}</p>
        <span className="text-teal-400 font-mono font-bold bg-teal-500/5 px-5 py-1 rounded-lg border border-teal-500/10">
           {Number(item.price).toLocaleString()} د.ع
        </span>
      </div>
      
      {/* الكمية والإجمالي */}
      <div className="flex items-center gap-8 bg-black/40 px-8 py-1 rounded-3xl border border-neutral-800">
         <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-mono">الكمية</p>
            <p className="text-xl font-black text-white">{item.qty}</p>
         </div>
         <div className="h-8 w-[5px] bg-neutral-800"></div>
         <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase font-mono">المجموع</p>
            <p className="text-l font-bold text-teal-400">{(Number(item.price) * Number(item.qty)).toLocaleString()}</p>
         </div>
      </div>
    </div>
  ))}
</div>
                  <div className="bg-gradient-to-r from-[#12131a] to-[#0a0a0f] rounded-3xl p-2 border-3 border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                     <div className="flex justify-between items-center mb-3 text-gray-400 font-mono text-lg">
                        <span>مجموع أسعار المواد:</span>
                        <span className="text-white">{Number(selectedOrder.subtotalAmount).toLocaleString()} د.ع</span>
                     </div>
                     <div className="flex justify-between items-center mb-1 pb-5 border-b border-neutral-700 text-gray-400 font-mono text-lg">
                        <span>أجور النقل المُضافة للطلب:</span>
                        <span className="text-white">{(Number(selectedOrder.deliveryFee) || 0).toLocaleString()} د.ع</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-white tracking-wide">المبلغ الكلي للاستلام:</span>
                        <span className="text-2xl font-black font-mono text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">
                           {Number(selectedOrder.totalAmount).toLocaleString()} <span className="text-2xl">د.ع</span>
                        </span>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}

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
                placeholder="اكتب اسم القائمة الجديدة هنا..." 
                value={newCatInput} 
                onChange={e => setNewCatInput(e.target.value)} 
                className="flex-grow p-3 bg-black/60 border border-neutral-800 text-white rounded-xl text-sm focus:outline-none focus:border-teal-500 shadow-inner" 
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
                className="bg-teal-600/20 text-teal-400 border border-teal-500/30 px-5 rounded-xl font-bold hover:bg-teal-500 hover:text-black transition-all text-sm"
              >
                إضافة
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {(categories || []).map(cat => (
                <div key={cat.id} className="flex justify-between items-center bg-neutral-900/40 p-4 rounded-xl border border-neutral-800 transition-colors hover:border-teal-500/20">
                  
                  {editCatId === cat.id ? (
                    <div className="flex gap-2 w-full items-center">
                      <input 
                        type="text" 
                        value={editCatInput} 
                        onChange={e => setEditCatInput(e.target.value)} 
                        className="flex-grow p-2 bg-black border border-teal-500/50 text-white rounded-lg text-sm outline-none shadow-inner" 
                      />
                      <button type="button" onClick={(e) => { e.preventDefault(); handleEditCategory(cat.id, cat.name, editCatInput); setEditCatId(null); }} className="text-teal-400 hover:text-teal-300 font-bold text-sm bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/30">حفظ</button>
                      <button type="button" onClick={(e) => { e.preventDefault(); setEditCatId(null); }} className="text-gray-400 hover:text-white text-sm bg-neutral-800 px-3 py-1.5 rounded-lg">إلغاء</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-200 font-bold text-sm flex items-center gap-2">
                        <i className="fa-solid fa-tag text-neutral-600 text-xs"></i> {cat.name}
                      </span>
                      <div className="flex gap-2">
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
                  <p className="text-gray-500 text-sm">لا توجد قوائم حالياً. قم بإضافة قائمة جديدة للبدء.</p>
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
            className="relative w-full max-w-4xl bg-[#0c0c11] border border-teal-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowDeliveryManager(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>

            <h3 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-3 border-b border-neutral-800 pb-4">
               <i className="fa-solid fa-truck-fast"></i> إدارة مناطق وأسعار التوصيل
            </h3>

            <div className="flex flex-col md:flex-row gap-8">
               <div className="w-full md:w-1/3 bg-[#12131a] p-6 rounded-2xl border border-teal-500/20 shadow-inner h-fit">
                  <h4 className="text-lg font-bold text-white mb-5">إضافة محافظة جديدة</h4>
                  <div className="space-y-4">
                     <input type="text" placeholder="اسم المحافظة (مثال: بغداد)" value={newGovName} onChange={e => setNewGovName(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-teal-500 outline-none transition-all" />
                     <input type="number" placeholder="سعر التوصيل (مثال: 5000)" value={newGovPrice} onChange={e => setNewGovPrice(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-teal-500 outline-none transition-all" />
                     <input type="text" placeholder="الوقت المتوقع (مثال: 2-3 أيام)" value={newGovTime} onChange={e => setNewGovTime(e.target.value)} className="w-full p-3 bg-black border border-neutral-700 text-white rounded-xl text-sm focus:border-teal-500 outline-none transition-all" />
                     <button onClick={handleAddDeliveryLocation} className="w-full py-3 mt-2 bg-teal-500 text-black rounded-xl text-sm font-bold hover:bg-teal-400 transition-all shadow-md">
                        <i className="fa-solid fa-plus"></i> إضافة للقائمة
                     </button>
                  </div>
               </div>

               <div className="w-full md:w-2/3 bg-[#12131a] p-6 rounded-2xl border border-teal-500/20 flex flex-col">
                  <h4 className="text-lg font-bold text-white mb-5 flex justify-between items-center">
                     <span>المحافظات المسجلة للزبائن</span>
                     <span className="text-xs bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full font-mono border border-teal-500/30">{deliveryLocations.length} محافظات</span>
                  </h4>
                  <div className="flex-grow overflow-y-auto max-h-[400px] custom-scrollbar space-y-3 pr-2">
                     {deliveryLocations.length === 0 ? (
                        <div className="text-center py-10">
                           <i className="fa-solid fa-map-location-dot text-4xl text-neutral-600 mb-3"></i>
                           <p className="text-gray-500 text-sm">لا توجد محافظات مضافة حالياً.</p>
                        </div>
                     ) : (
                        deliveryLocations.map(gov => (
                           <div key={gov.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-neutral-800 hover:border-teal-500/40 transition-all shadow-sm">
                              <div>
                                 <p className="text-white font-bold text-base mb-1">{gov.name}</p>
                                 <div className="flex items-center gap-3">
                                    <span className="text-xs text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                                       {Number(gov.price).toLocaleString()} د.ع
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">
                                       <i className="fa-regular fa-clock"></i> {gov.time}
                                    </span>
                                 </div>
                              </div>
                              <button onClick={() => handleDeleteDeliveryLocation(gov.id)} className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20">
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
}