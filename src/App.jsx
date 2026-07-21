import AdminPanel from './AdminPanel'; 
import './App.css';

import {ADMIN_UID, db, auth, provider } from './firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc, updateDoc, getDoc, onSnapshot, increment, where } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';

const translations = {
  ar: {
    adminLogin: "الإدارة",
    adminLeave: "خروج الإدارة",
    cloudLogin: "دخول سحابي",
    cart: "السلة",
    cancelOrder: "إلغاء الطلب",
    processing: "قيد التجهيز",
    heroSub: "قطع ألكترونية مهندسة بدقة عالية",
    heroTitle1: "مستقبلك",
    heroTitle2: "بالروبوت",
    heroTitle3: "يبدأ هنا",
    heroDesc: "منفذك المتكامل للحصول على بوردات التحكم ومحركات السيرفو وعضلات التحكم الدقيقة. نوفر القطع بأعلى كفاءة لمشروع التخرج أو مشروعك البرمجي القادم.",
    browseCat: "تصفح كتالوج المنتجات",
    catTitle: "القطع المتاحة للفحص والطلب",
    catDesc: "اضغط فوق الصورة للقطعة لعرضها ومعاينة تفاصيل المكونات بدقة",
    searchPlaceholder: "  ابحث بالاسم، الوصف، بالمودل، أو حتى السعر...  ",
    notFoundTitle: "لم يتم العثور على قطع تطابق بحثك",
    notFoundDesc: "جرب استخدام كلمات مفتاحية أخرى أو تحقق من السعر.",
    viewDetails: "عرض التفاصيل",
    price: "السعر",
    addToCart: "إضافة للسلة",
    cartTitle: "سلة الطلبات الرقمية",
    cartInfo: "بيانات المستلم والتوصيل",
    cartName: "اسم المستلم",
    cartPhone: "رقم الهاتف النشط",
    cartPhone2: "رقم هاتف إضافي (اختياري)",
    cartAddress: "العنوان الدقيق (المنطقة، الشارع، أقرب دالة)",
    cartSub: "المجموع الفرعي:",
    cartDelivery: "أجور النقل:",
    cartTime: "وقت التوصيل المتوقع:",
    cartTotal: "الإجمالي الكلي:",
    cartCheckout: "تأكيد وحجز الطلب",
    cartItems: "المواد المطلوبة",
    cartEmpty: "السلة فارغة حالياً",
    currency: "د.ع",
    noDesc: "لا يتوفر وصف دقيق لهذا المنتج في الوقت الحالي.",
    itemCount: "صنف",
    installApp: "تثبيت التطبيق",
    whatsappSupport: "ارسل رسالة عبر الواتساب",
    projects: "المشاريع المنجزة",
    menu: "القائمة"
  },
  en: {
    adminLogin: "Admin",
    adminLeave: "Leave Admin",
    cloudLogin: "Login",
    cart: "Cart",
    cancelOrder: "Cancel Order",
    processing: "Processing",
    heroSub: "PRECISION ENGINEERED ORIGINAL PARTS",
    heroTitle1: "YOUR FUTURE OF",
    heroTitle2: "ROBOTIC",
    heroTitle3: "STARTS HERE",
    heroDesc: "Your integrated portal for Control Boards, servo motors, and precision control muscles.",
    browseCat: "Browse Product Catalog",
    catTitle: "Available Parts for Inspection & Order",
    catDesc: "Hover over the part to experience the 3D holographic effect",
    searchPlaceholder: "  Search by name, description, code, or price...  ",
    notFoundTitle: "No matching parts found",
    notFoundDesc: "Try browsing other keywords.",
    viewDetails: "View Details",
    price: "PRICE",
    addToCart: "Add to Cart",
    cartTitle: "Digital Order Cart",
    cartInfo: "Recipient Info",
    cartName: "Recipient Name",
    cartPhone: "Active Phone Number",
    cartPhone2: "Extra Phone (Optional)",
    cartAddress: "Exact Delivery Address",
    cartSub: "Subtotal:",
    cartDelivery: "Delivery:",
    cartTime: "Est. Delivery Time:",
    cartTotal: "Grand Total:",
    cartCheckout: "Confirm Order",
    cartItems: "Requested Items",
    cartEmpty: "Cart is currently empty",
    currency: "IQD",
    noDesc: "No description available.",
    itemCount: "Items",
    installApp: "Install App",
    whatsappSupport: "Send a message via WhatsApp",
    projects: "Completed Projects",
    menu: "Menu"
  },
  ku: {
    adminLogin: "بەڕێوەبەر",
    adminLeave: "دەرچوون",
    cloudLogin: "چوونەژوورەوە",
    cart: "سەبەتە",
    cancelOrder: "هەڵوەشاندنەوە",
    processing: "لە جێبەجێکردندایە",
    heroSub: "پارچەی ئەسڵی بە وردی ئەندازیاری کراوە",
    heroTitle1: "داهاتووی",
    heroTitle2: "رۆبۆتەکان",
    heroTitle3: "لێرەوە دەست پێدەکات",
    heroDesc: "دەروازەی تەواوەتیت بۆ بۆردەکانی کۆنترۆڵ و مۆتۆڕەکان.",
    browseCat: "کەتەلۆگی بەرهەمەکان",
    catTitle: "پارچە بەردەستەکان",
    catDesc: "ماوسەکە ببە سەر پارچەکە بۆ بینینی کاریگەری سێ دووری",
    searchPlaceholder: "  گەڕان ...  ",
    notFoundTitle: "هیچ پارچەیەک نەدۆزرایەوە",
    notFoundDesc: "بەشەکان بپشکنە.",
    viewDetails: "وردەکارییەکان",
    price: "نرخ",
    addToCart: "زیادکردن بۆ سەبەتە",
    cartTitle: "سەبەتەی داواکاری",
    cartInfo: "زانیاری وەرگر",
    cartName: "ناوی وەرگر",
    cartPhone: "ژمارەی تەلەفۆن",
    cartPhone2: "مۆبایلی جێگرەوە (ئارەزوومەندانە)",
    cartAddress: "ناونیشانی گەیاندن",
    cartSub: "کۆی لاوەکی:",
    cartDelivery: "گەیاندن:",
    cartTime: "کاتی گەیاندن:",
    cartTotal: "کۆی گشتی:",
    cartCheckout: "پشتڕاستکردنەوە",
    cartItems: "کەرەستەکان",
    cartEmpty: "سەبەتەکە خاڵییە",
    currency: "د.ع",
    noDesc: "هیچ وەسفێکی ورد بەردەست نییە.",
    itemCount: "پارچە",
    installApp: "دابەزاندنی بەرنامە",
    whatsappSupport: "لە ڕێگەی واتسئەپەوە نامە بنێرە",
    projects: "پڕۆژەکان",
    menu: "پێڕست"
  }
};

const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase()
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, ''); 
};

// Singleton AudioContext لتحسين الأداء على الموبايل
let globalAudioCtx = null;

export default function App() {
  const [lang, setLang] = useState('ar');
  const t = translations[lang]; 

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false); 
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false); 
  
  const [activeGallery, setActiveGallery] = useState(null); 
  
  const [customerName, setCustomerName] = useState(''); 
  const [customerPhone, setCustomerPhone] = useState(''); 
  const [customerPhone2, setCustomerPhone2] = useState(''); 
  const [detailedAddress, setDetailedAddress] = useState(''); 
  const [selectedGovId, setSelectedGovId] = useState(''); 
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  const [user, setUser] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState(''); 
  const [visitorCount, setVisitorCount] = useState(0); 
  const [cartAnnouncement, setCartAnnouncement] = useState(''); // حالة لإعلان السلة
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]); 
  
  const [categories, setCategories] = useState([]);
  const [newProdCategory, setNewProdCategory] = useState('');

  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImg, setNewProdImg] = useState(''); 
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImages, setNewProdImages] = useState([]); 
  const [newProdStock, setNewProdStock] = useState(''); 
  const [newProdOrderIndex, setNewProdOrderIndex] = useState('');
  const [newProdChip, setNewProdChip] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdCompatLink, setNewProdCompatLink] = useState('');
  const [newProdCompatIds, setNewProdCompatIds] = useState([]); 
  const [newProdLibLink, setNewProdLibLink] = useState('');
  const [newProdCodeSnippet, setNewProdCodeSnippet] = useState('');
  
  const [editProdId, setEditProdId] = useState(null);
  const [orders, setOrders] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalTab, setModalTab] = useState('compat');

  // حالات كمية المنتج داخل الـ Modal
  const [modalQty, setModalQty] = useState(1);
  const [modalQtyWarning, setModalQtyWarning] = useState('');

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const magneticBtnRef = useRef(null);
  const magneticContainerRef = useRef(null);
  
  // Ref الخاص بحساب خمول المستخدم للزيارات
  const isActiveVisitor = useRef(false);
  const inactivityTimerRef = useRef(null);
  
  // Ref الخاص بالتحميل المتأخر للمشاريع
  const projectsFetchedRef = useRef(false);
  const projectsFetchTimerRef = useRef(null);

  const playSynthSound = useCallback((freq, type, duration) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!globalAudioCtx) globalAudioCtx = new AudioContextClass();
      if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
      
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, globalAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);
      osc.start();
      osc.stop(globalAudioCtx.currentTime + duration);
    } catch (e) {}
  }, []);

  const playHoverBeep = useCallback(() => playSynthSound(1200, 'triangle', 0.05), [playSynthSound]);
  const playSuccessBeep = useCallback(() => {
    playSynthSound(600, 'sine', 0.1);
    setTimeout(() => playSynthSound(900, 'sine', 0.15), 80);
  }, [playSynthSound]);
  const playErrorBuzz = useCallback(() => playSynthSound(150, 'sawtooth', 0.4), [playSynthSound]);

  // إدارة 5 دقائق خمول الزائر
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    if (!isActiveVisitor.current) {
        isActiveVisitor.current = true;
        const statsRef = doc(db, "system", "stats");
        setDoc(statsRef, { visitorCount: increment(1) }, { merge: true }).catch(e => console.error(e));
    }

    inactivityTimerRef.current = setTimeout(() => {
        isActiveVisitor.current = false;
        const statsRef = doc(db, "system", "stats");
        setDoc(statsRef, { visitorCount: increment(-1) }, { merge: true }).catch(e => console.error(e));
    }, 5 * 60 * 1000); 
  }, []);

  // منع زر الرجوع من الخروج من الموقع
  useEffect(() => {
    const isAnyModalOpen = activeGallery || selectedProduct || isProjectsModalOpen || isCartOpen || isSideMenuOpen;
    if (isAnyModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
    }
  }, [activeGallery, selectedProduct, isProjectsModalOpen, isCartOpen, isSideMenuOpen]);

  useEffect(() => {
    const handlePopState = (e) => {
        if (activeGallery) { setActiveGallery(null); playSynthSound(400, 'sine', 0.1); }
        else if (selectedProduct) { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }
        else if (isProjectsModalOpen) { setIsProjectsModalOpen(false); playSynthSound(400, 'sine', 0.1); }
        else if (isCartOpen) { setIsCartOpen(false); playSynthSound(400, 'sine', 0.1); }
        else if (isSideMenuOpen) { setIsSideMenuOpen(false); playSynthSound(400, 'sine', 0.1); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeGallery, selectedProduct, isProjectsModalOpen, isCartOpen, isSideMenuOpen, playSynthSound]);

  // Load and auto-clear cart after 18 hours
  useEffect(() => {
    const savedCart = localStorage.getItem('msa_store_cart');
    const savedTime = localStorage.getItem('msa_store_cart_time');
    if (savedCart && savedTime) {
      const timeDiff = Date.now() - parseInt(savedTime);
      if (timeDiff > 18 * 60 * 60 * 1000) {
        localStorage.removeItem('msa_store_cart');
        localStorage.removeItem('msa_store_cart_time');
      } else {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  // Save cart changes and time
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('msa_store_cart', JSON.stringify(cart));
      localStorage.setItem('msa_store_cart_time', Date.now().toString());
    } else {
      localStorage.removeItem('msa_store_cart');
      localStorage.removeItem('msa_store_cart_time');
    }
  }, [cart]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("التطبيق مثبت بالفعل أو أن متصفحك لا يدعم هذه الميزة حالياً.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      playSynthSound(800, 'sine', 0.1);
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      const userDocRef = doc(db, "users", loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      let phone = '';
      let phone2 = '';
      let address = '';
      let govId = '';
      if (userDoc.exists()) {
        phone = userDoc.data().phone || '';
        phone2 = userDoc.data().phone2 || '';
        address = userDoc.data().address || '';
        govId = userDoc.data().govId || '';
      }

      const userData = {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        phone: phone,
        phone2: phone2,
        address: address,
        govId: govId,
        lastLogin: new Date().toISOString()
      };

      await setDoc(userDocRef, userData, { merge: true });
      localStorage.setItem("msa_store_customer", JSON.stringify(userData));
      setUser(userData);
      
      if (loggedInUser.displayName) setCustomerName(loggedInUser.displayName);
      setCustomerPhone(phone);
      setCustomerPhone2(phone2);
      setDetailedAddress(address);
      if(govId) setSelectedGovId(govId);
      
      playSuccessBeep();
      
      if(loggedInUser.uid === ADMIN_UID) {
        alert(`مرحباً بك سيادة المدير MSA STORE! تم تفعيل صلاحيات الإدارة حالياً.`);
      } else {
        alert(`مرحباً بك : ${loggedInUser.displayName} `);
      }
    } catch (error) {
      playErrorBuzz();
      alert("فشل الاتصال بخوادم المصادقة.");
    }
  };

  const handleLogout = async () => {
    try {
      playSynthSound(400, 'sawtooth', 0.2);
      await signOut(auth);
      localStorage.removeItem("msa_store_customer");
      setUser(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerPhone2('');
      setDetailedAddress('');
      setSelectedGovId('');
      setIsAdminMode(false);
      alert("تم قطع الاتصال بنجاح.");
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetVisitors = () => {
    if(window.confirm("هل أنت متأكد من تصفير عداد الزوار الحاليين؟")) {
       setDoc(doc(db, "system", "stats"), { visitorCount: 0 }, { merge: true });
       playSuccessBeep();
    }
  };

  // دالة حفظ الإعلان الخاص بالسلة
  const handleSaveCartAnnouncement = async (text) => {
    try {
      await setDoc(doc(db, "system", "stats"), { cartAnnouncement: text }, { merge: true });
      playSuccessBeep();
      alert("تم حفظ إعلان السلة ونشره بنجاح!");
    } catch(e) {
      console.error(e);
      playErrorBuzz();
      alert("حدث خطأ أثناء حفظ الإعلان.");
    }
  };

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("timestamp", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    } catch (error) {
      console.error("خطأ في جلب الطلبات:", error);
    }
  };

  const handleCompleteOrder = async (orderToComplete) => {
    try {
        playSynthSound(400, 'sawtooth', 0.2);
        const orderRef = doc(db, "orders", String(orderToComplete.id));
        await updateDoc(orderRef, { status: 'completed' });
        
        setOrders(prev => prev.map(o => o.id === orderToComplete.id ? { ...o, status: 'completed' } : o));
        alert("تم إنجاز الطلب ونقله إلى قسم الطلبات المكتملة.");
    } catch (err) {
        console.error("Complete order error:", err);
        alert("حدث خطأ أثناء إنجاز الطلب.");
    }
  };

  const handleCancelOrder = async (orderToCancel) => {
    if(!window.confirm(lang === 'ar' ? "هل أنت متأكد من إلغاء هذا الطلب؟ سيتم استرجاع المخزون للمنتجات." : "Are you sure you want to cancel this order? Stock will be returned.")) return;

    try {
      playSynthSound(400, 'sawtooth', 0.2);
      
      if (orderToCancel.items && Array.isArray(orderToCancel.items)) {
         for (const item of orderToCancel.items) {
             try {
                 const prodRef = doc(db, "products", String(item.id));
                 await updateDoc(prodRef, { 
                     stock: increment(item.qty),
                     sales: increment(-item.qty)
                 });
             } catch(e) {}
         }
      }
      
      await deleteDoc(doc(db, "orders", String(orderToCancel.id)));
      
      setOrders(prev => prev.filter(o => o.id !== orderToCancel.id));
      
      const guestOrders = JSON.parse(localStorage.getItem('msa_guest_orders') || '[]');
      const updatedGuestOrders = guestOrders.filter(id => id !== orderToCancel.id);
      localStorage.setItem('msa_guest_orders', JSON.stringify(updatedGuestOrders));

      fetchProducts(); 
      alert(lang === 'ar' ? "تم إلغاء الطلب واسترجاع المخزون بنجاح." : "Order cancelled and stock returned successfully.");
    } catch (err) {
      console.error("Cancel order error:", err);
      alert(lang === 'ar' ? "حدث خطأ أثناء إلغاء الطلب." : "Error cancelling order.");
    }
  };

  const fetchDeliveryLocations = async () => {
    try {
      const snap = await getDocs(collection(db, "delivery_locations"));
      if (!snap.empty) {
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveryLocations(fetched);
        localStorage.setItem("msa_delivery_cache", JSON.stringify(fetched));
      }
    } catch (e) {
      const localCache = localStorage.getItem("msa_delivery_cache");
      if (localCache) setDeliveryLocations(JSON.parse(localCache));
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      if (!querySnapshot.empty) {
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(fetched);
        localStorage.setItem("msa_categories_cache", JSON.stringify(fetched));
      }
    } catch (error) {
      const localCache = localStorage.getItem("msa_categories_cache");
      if (localCache) setCategories(JSON.parse(localCache));
    }
  };
  
  // دالة جلب المشاريع بشكل منفصل للتحكم بها
  const fetchProjectsData = useCallback(async () => {
      if (projectsFetchedRef.current) return;
      projectsFetchedRef.current = true; // منع التكرار
      try {
          const q = query(collection(db, "projects"), limit(50));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const projData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setProjectsList(projData);
          }
      } catch (error) {
          console.error("خطأ في جلب المشاريع", error);
          projectsFetchedRef.current = false;
      }
  }, []);

  const fetchExternalLinks = async () => {
    try {
      const q = query(collection(db, "external_links"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setExternalLinks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error("خطأ في جلب الروابط الخارجية", error);
    }
  };

  const handleAddCategory = async (catName) => {
    if(!catName.trim()) return;
    try {
      playSuccessBeep();
      const docRef = await addDoc(collection(db, "categories"), { name: catName });
      const newCat = { id: docRef.id, name: catName };
      setCategories(prev => {
        const updated = [...prev, newCat];
        localStorage.setItem("msa_categories_cache", JSON.stringify(updated));
        return updated;
      });
      setNewProdCategory(catName); 
    } catch(err) { 
      playErrorBuzz();
      alert("عذراً، فشل إضافة الفئة.");
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    try {
      playErrorBuzz();
      await deleteDoc(doc(db, "categories", id));
      setCategories(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem("msa_categories_cache", JSON.stringify(updated));
        return updated;
      });
      if(newProdCategory === catName) setNewProdCategory(''); 
    } catch(err) {
      alert("فشل حذف الفئة.");
    }
  };

  const handleEditCategory = async (id, oldName, newName) => {
    if(!newName.trim()) return;
    try {
      playSuccessBeep();
      await updateDoc(doc(db, "categories", id), { name: newName });
      setCategories(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, name: newName } : c);
        localStorage.setItem("msa_categories_cache", JSON.stringify(updated));
        return updated;
      });
      if(newProdCategory === oldName) setNewProdCategory(newName); 
    } catch(err) { 
      alert("فشل تعديل الفئة.");
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), limit(1000));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      }
    } catch (error) {
      console.error(error);
    }
  };

   useEffect(() => {
    fetchProducts(); 
    fetchCategories();
    fetchDeliveryLocations();
    fetchExternalLinks();
    resetInactivityTimer();


     projectsFetchTimerRef.current = setTimeout(() => {
        fetchProjectsData();
    }, 8000); 
    
    const statsRef = doc(db, "system", "stats");

    const decreaseCount = () => {
      if (isActiveVisitor.current) {
        setDoc(statsRef, { visitorCount: increment(-1) }, { merge: true }).catch(e => console.error(e));
        isActiveVisitor.current = false;
      }
    };

    window.addEventListener('beforeunload', decreaseCount);
    
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const count = data.visitorCount || 0;
        setVisitorCount(Math.max(0, count)); 
        
        setCartAnnouncement(data.cartAnnouncement || '');
      }
    });

    if (isAdminMode) {
      fetchOrders();
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      decreaseCount();
      window.removeEventListener('beforeunload', decreaseCount);
      unsubscribeStats();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (projectsFetchTimerRef.current) clearTimeout(projectsFetchTimerRef.current);
    };
  }, [isAdminMode, resetInactivityTimer, fetchProjectsData]);


  const handleProjectsClick = () => {
      if (projectsFetchTimerRef.current) clearTimeout(projectsFetchTimerRef.current); // إلغاء التأخير
      fetchProjectsData(); // الجلب الفوري إذا لم يتم جلبها بعد
      setIsProjectsModalOpen(true);
      setIsSideMenuOpen(false);
      playSynthSound(600, 'sine', 0.1);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem("msa_store_customer");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setCustomerName(parsed.name || '');
          setCustomerPhone(parsed.phone || '');
          setCustomerPhone2(parsed.phone2 || '');
          setDetailedAddress(parsed.address || '');
          if(parsed.govId) setSelectedGovId(parsed.govId);
        } else {
          const userData = { uid: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email, photoURL: firebaseUser.photoURL };
          setUser(userData);
          setCustomerName(firebaseUser.displayName || '');
        }
      } else {
        setUser(null);
      }
    });

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    let mouseX = 0, mouseY = 0;
    let outerX = 0, outerY = 0;
    let throttleTimer = null;
    let cursorAnimFrame = null;

    if (!isTouchDevice) {
      const handleMouseMove = (e) => {
        if(throttleTimer) return;
        throttleTimer = setTimeout(() => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          if (cursorInnerRef.current) {
            cursorInnerRef.current.style.left = `${mouseX}px`;
            cursorInnerRef.current.style.top = `${mouseY}px`;
          }
          throttleTimer = null;
        }, 16); 
      };
      window.addEventListener('mousemove', handleMouseMove);

      const updateCursor = () => {
        outerX += (mouseX - outerX) * 0.15;
        outerY += (mouseY - outerY) * 0.15;
        if (cursorOuterRef.current) {
          cursorOuterRef.current.style.left = `${outerX}px`;
          cursorOuterRef.current.style.top = `${outerY}px`;
        }
        cursorAnimFrame = requestAnimationFrame(updateCursor);
      };
      cursorAnimFrame = requestAnimationFrame(updateCursor);

      return () => {
        unsubscribe();
        window.removeEventListener('mousemove', handleMouseMove);
        if(cursorAnimFrame) cancelAnimationFrame(cursorAnimFrame);
      };
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const mContainer = magneticContainerRef.current;
    const mBtn = magneticBtnRef.current;
    if (!mContainer || !mBtn) return;

    const onMove = (e) => {
      const bound = mBtn.getBoundingClientRect();
      const x = e.clientX - (bound.left + bound.width / 2);
      const y = e.clientY - (bound.top + bound.height / 2);
      gsap.to(mBtn, { x: x * 0.45, y: y * 0.45, duration: 0.1, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(mBtn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };

    mContainer.addEventListener('mousemove', onMove);
    mContainer.addEventListener('mouseleave', onLeave);
    return () => {
      mContainer.removeEventListener('mousemove', onMove);
      mContainer.removeEventListener('mouseleave', onLeave);
    };
  }, [isAdminMode]);

  const handleMouseEnterInteractive = useCallback(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    document.body.classList.add('hover-state');
    playHoverBeep();
  }, [playHoverBeep]);

  const handleMouseLeaveInteractive = useCallback(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    document.body.classList.remove('hover-state');
  }, []);

  const handleCardMove = useCallback((e, card) => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }, []);

  const handleCardLeave = useCallback((card) => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  }, []);

  const addToCart = (id, name, price, image, stock, qtyToAdd = 1) => {
    const stockVal = parseInt(stock) || 0;
    if (stockVal <= 0) {
       playErrorBuzz();
       alert("عذراً، هذا المنتج نافذ من المخزن حالياً.");
       return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === id);
      const currentQty = existing ? existing.qty : 0;
      
      if (currentQty + qtyToAdd > stockVal) {
          playErrorBuzz();
          alert(`عذراً، الكمية المطلوبة تتجاوز المخزون المتاح. المتبقي: ${stockVal - currentQty}`);
          return prevCart;
      }

      playSuccessBeep();
      if (existing) {
        return prevCart.map((item) => item.id === id ? { ...item, qty: item.qty + qtyToAdd } : item);
      }
      return [...prevCart, { id, name, price, image, qty: qtyToAdd }];
    });
  };

  const updateQty = (id, delta) => {
    playSynthSound(1000, 'triangle', 0.05);
    setCart((prevCart) => prevCart.map((item) => {
      if (item.id === id) {
        const newQty = (parseInt(item.qty) || 0) + delta;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter((item) => item.qty > 0));
  };

  const setItemQty = (id, newQty) => {
    if (newQty === '') {
       setCart(prev => prev.map(item => item.id === id ? { ...item, qty: '' } : item));
       return;
    }
    const val = parseInt(newQty, 10);
    if (isNaN(val) || val < 0) return;
    
    if (val === 0) {
        setCart(prev => prev.filter(item => item.id !== id));
    } else {
        playSynthSound(1000, 'triangle', 0.05);
        setCart(prev => prev.map(item => item.id === id ? { ...item, qty: val } : item));
    }
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.qty) || 0), 0), [cart]);
  const totalQty = useMemo(() => cart.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0), [cart]);
  
  const activeGov = useMemo(() => deliveryLocations.find(g => g.id === selectedGovId) || { price: 0, time: '', name: '' }, [deliveryLocations, selectedGovId]);
  const currentDeliveryFee = Number(activeGov.price) || 0;

  const handleCheckout = async () => {
    const finalCart = cart.map(item => ({...item, qty: parseInt(item.qty) || 1})).filter(item => item.qty > 0);

    if (finalCart.length === 0) {
      alert(lang === 'ar' ? 'سلة المشتريات فارغة حالياً!' : 'Cart is empty!');
      return;
    }
    if(!customerName || !customerPhone || !selectedGovId || !detailedAddress) {
        alert(lang === 'ar' ? 'الرجاء إكمال جميع بيانات المستلم الأساسية (الاسم، الهاتف، المحافظة، العنوان الدقيق)!' : 'Please fill all required recipient info!');
        return;
    }
    
    playSynthSound(1500, 'sine', 0.5);
    
    const payloadData = {
      userId: user && user.uid ? String(user.uid) : "GUEST_USER",
      customerName: String(customerName || "غير محدد"),
      customerPhone: String(customerPhone || "غير محدد"),
      customerPhone2: String(customerPhone2 || ""),
      location: String(`${activeGov.name || ''} - ${detailedAddress || ''}`),
      governorate: String(activeGov.name || ''),
      expectedTime: String(activeGov.time || ''),
      items: finalCart.map(item => ({
          id: String(item.id || ''),
          name: String(item.name || ''),
          price: Number(item.price) || 0,
          image: String(item.image || ''),
          qty: Number(item.qty) || 1
      })),
      subtotalAmount: Number(subtotal) || 0,
      deliveryFee: Number(currentDeliveryFee) || 0,
      totalAmount: (Number(subtotal) || 0) + (Number(currentDeliveryFee) || 0),
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), payloadData);
      
      if (!user || user.uid === "GUEST_USER") {
          const guestOrders = JSON.parse(localStorage.getItem('msa_guest_orders') || '[]');
          guestOrders.push(docRef.id);
          localStorage.setItem('msa_guest_orders', JSON.stringify(guestOrders));
      }

      try {
        if (user && user.uid && user.uid !== "GUEST_USER") {
          const userDataRef = doc(db, "users", user.uid);
          await setDoc(userDataRef, { phone: customerPhone, phone2: customerPhone2, address: detailedAddress, govId: selectedGovId }, { merge: true });
          const updatedUser = { ...user, phone: customerPhone, phone2: customerPhone2, address: detailedAddress, govId: selectedGovId };
          localStorage.setItem("msa_store_customer", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (errUser) {}

      try {
        for (const item of finalCart) {
            const productInState = products.find(p => p.id === item.id);
            if (productInState) {
              const currentStock = parseInt(productInState.stock) || 0;
              const newStock = Math.max(0, currentStock - item.qty); 
              const prodRef = doc(db, "products", String(item.id));
              await updateDoc(prodRef, { 
                  stock: newStock,
                  sales: increment(item.qty)
              });
            }
        }
      } catch (errStock) {}

      alert(lang === 'ar' ? `تم استلام طلبك بنجاح! سيتم التوصيل خلال: ${activeGov.time || 'يحدد لاحقاً'}` : `Order received successfully!`);
      setCart([]); 
      setIsCartOpen(false);
      fetchProducts();
    } catch (errOrder) {
      console.error("الفايربيس رفض الطلب:", errOrder);
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً أو التحقق من صحة البيانات.");
    }
  };

  const handleSaveProduct = async () => {
    if(!newProdName || !newProdPrice) {
        alert("الرجاء إدخال اسم وسعر المنتج على الأقل!");
        return;
    }
    if(newProdImages.length > 10) {
        alert("الحد الأقصى المسموح به هو 10 صور للمنتج الواحد.");
        return;
    }
    playSuccessBeep();

    try {
      if (editProdId) {
        const productRef = doc(db, "products", String(editProdId));
        const updatedData = {
          name: newProdName,
          price: parseInt(newProdPrice),
          stock: parseInt(newProdStock) || 0, 
          orderIndex: newProdOrderIndex !== '' ? parseInt(newProdOrderIndex) : 999,
          category: newProdCategory || '', 
          chip: newProdChip || 'NEW MCU', 
          code: newProdCode || 'GENERIC', 
          desc: newProdDesc || 'منتج معدّل.', 
          img: newProdImages.length > 0 ? newProdImages[0] : (newProdImg || products.find(p => p.id === editProdId).img), 
          images: newProdImages,
          compatLink: newProdCompatLink || '',
          compatProdIds: newProdCompatIds || [], 
          libLink: newProdLibLink || '',
          codeSnippet: newProdCodeSnippet || ''
        };
        await updateDoc(productRef, updatedData);
        setProducts(products.map(p => p.id === editProdId ? { ...p, ...updatedData } : p));
        alert('تم حفظ التعديلات في السحابة بنجاح!');
      } else {
        const newP = {
          name: newProdName,
          price: parseInt(newProdPrice),
          stock: parseInt(newProdStock) || 0, 
          sales: 0,
          orderIndex: newProdOrderIndex !== '' ? parseInt(newProdOrderIndex) : 999,
          category: newProdCategory || '', 
          chip: newProdChip || 'NEW MCU', 
          code: newProdCode || 'GENERIC', 
          desc: newProdDesc || 'منتج مضاف حديثاً بواسطة لوحة تحكم الإدارة المتقدمة.', 
          img: newProdImages.length > 0 ? newProdImages[0] : (newProdImg || 'http://googleusercontent.com/image_collection/image_retrieval/10232467606554598834_0'),
          images: newProdImages,
          compatLink: newProdCompatLink || '',
          compatProdIds: newProdCompatIds || [], 
          libLink: newProdLibLink || '',
          codeSnippet: newProdCodeSnippet || ''
        };
        const docRef = await addDoc(collection(db, "products"), newP);
        setProducts([...products, { id: docRef.id, ...newP }]);
        alert('تم حفظ القطعة في قاعدة البيانات السحابية الدائمة!');
      }

      setNewProdName('');
      setNewProdPrice('');
      setNewProdImg('');
      setNewProdDesc('');
      setNewProdStock('');
      setNewProdOrderIndex('');
      setNewProdCategory(''); 
      setNewProdChip(''); 
      setNewProdCode(''); 
      setNewProdImages([]);
      setNewProdCompatLink('');
      setNewProdCompatIds([]);
      setNewProdLibLink('');
      setNewProdCodeSnippet('');
      setEditProdId(null);
    } catch (error) {
      playErrorBuzz();
      console.error("Error saving product:", error);
      alert("حدث خطأ أثناء حفظ المنتج في قاعدة البيانات. تأكد من صلاحيات الإدارة.");
    }
  };

  const handleEditClick = (prod) => {
    setNewProdName(prod.name);
    setNewProdPrice(prod.price);
    setNewProdImg(prod.img);
    setNewProdDesc(prod.desc || ''); 
    setNewProdStock(prod.stock || ''); 
    setNewProdOrderIndex(prod.orderIndex !== undefined ? prod.orderIndex : '');
    setNewProdCategory(prod.category || ''); 
    setNewProdChip(prod.chip || ''); 
    setNewProdCode(prod.code || ''); 
    setNewProdImages(prod.images || (prod.img ? [prod.img] : [])); 
    setNewProdCompatLink(prod.compatLink || '');
    // التوافق مع الأنظمة السابقة التي كانت تعتمد على id واحد بدلاً من مصفوفة
    setNewProdCompatIds(prod.compatProdIds || (prod.compatProdId ? [prod.compatProdId] : []));
    setNewProdLibLink(prod.libLink || '');
    setNewProdCodeSnippet(prod.codeSnippet || '');
    setEditProdId(prod.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if(window.confirm("هل أنت متأكد من حذف هذه القطعة بشكل نهائي من قاعدة البيانات؟")) {
      try {
        playErrorBuzz();
        await deleteDoc(doc(db, "products", String(id)));
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("حدث خطأ أثناء محاولة الحذف من السحابة.");
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      playErrorBuzz();
      await deleteDoc(doc(db, "orders", String(orderId)));
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("حدث خطأ أثناء محاولة حذف الطلب.");
    }
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    return products.filter(prod => {
      const normName = normalizeText(prod.name);
      const normDesc = normalizeText(prod.desc);
      const normCat = normalizeText(prod.category);
      const normChip = normalizeText(prod.chip);
      const normCode = normalizeText(prod.code);
      const priceStr = prod.price ? prod.price.toString() : '';

      const matchSearch = normalizedQuery === '' ||
        normName.includes(normalizedQuery) ||
        normDesc.includes(normalizedQuery) ||
        normCat.includes(normalizedQuery) ||
        normChip.includes(normalizedQuery) ||
        normCode.includes(normalizedQuery) ||
        priceStr.includes(normalizedQuery);

      const matchCat = normalizedQuery !== '' ? true : (selectedCatFilter === '' || prod.category === selectedCatFilter);

      return matchSearch && matchCat;
    }).sort((a, b) => {
       const indexA = a.orderIndex !== undefined && a.orderIndex !== null && a.orderIndex !== '' ? parseInt(a.orderIndex) : 999;
       const indexB = b.orderIndex !== undefined && b.orderIndex !== null && b.orderIndex !== '' ? parseInt(b.orderIndex) : 999;
       return indexA - indexB;
    });
  }, [products, searchQuery, selectedCatFilter]);

  const handleModalQtyChange = (delta, availableStock) => {
    const newVal = modalQty + delta;
    if (newVal > availableStock) {
        setModalQtyWarning('المنتج نفذ لحد هذه القيمة!');
        playErrorBuzz();
        setTimeout(() => setModalQtyWarning(''), 3000);
        return;
    }
    if (newVal >= 1) {
        setModalQty(newVal);
        setModalQtyWarning('');
    }
  };

  return (
    <div className={`tech-grid relative min-h-screen font-sans overflow-x-hidden select-none antialiased transition-colors duration-500 bg-[#0f172a] text-gray-100 flex flex-col w-full`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
      
      <div ref={cursorOuterRef} className={`custom-cursor hidden md:block fixed top-0 left-0 w-[30px] h-[30px] border rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] border-teal-500/60`}></div>
      <div ref={cursorInnerRef} className={`custom-cursor-dot hidden md:block fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] bg-teal-500`}></div>

      <header className={`border-b fixed top-0 left-0 right-0 z-50 px-2 sm:px-6 py-2 sm:py-3 backdrop-blur-md transition-colors duration-500 border-teal-500/20 bg-slate-900/90 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center w-full gap-y-2">
          
          <div className="flex flex-row items-center gap-2 sm:gap-3 flex-shrink-0" style={{ direction: 'ltr' }}>
            <div className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all bg-teal-500/10 border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-deep-pulse">
              <i className="fas fa-microchip text-xl text-teal-400"></i>
            </div>
            
            <button 
              onClick={() => setIsSideMenuOpen(true)} 
              className="flex items-center gap-2 text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3 py-2 rounded-lg hover:bg-teal-500 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
            >
              <i className="fas fa-bars text-lg"></i> <span className={`font-mono text-xs font-bold tracking-widest hidden sm:inline`}>{t.menu}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 flex-wrap justify-end">
            
            <div className={`flex items-center bg-slate-900/80 border border-teal-500/30 rounded-full p-1 backdrop-blur-sm shadow-inner`}>
              <button type="button" onClick={() => setLang('ar')} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${lang === 'ar' ? 'bg-teal-500 text-slate-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>AR</button>
              <button type="button" onClick={() => setLang('ku')} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${lang === 'ku' ? 'bg-teal-500 text-slate-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>KU</button>
              <button type="button" onClick={() => setLang('en')} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${lang === 'en' ? 'bg-teal-500 text-slate-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>EN</button>

            </div>

            {user && user.uid === ADMIN_UID && (
              <div className="flex items-center gap-2">
                 <button 
                   type="button"
                   onMouseEnter={handleMouseEnterInteractive} onMouseLeave={handleMouseLeaveInteractive}
                   onClick={() => { playSynthSound(900, 'sine', 0.1); setIsAdminMode(!isAdminMode); }}
                   className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white rounded-full font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                   title={isAdminMode ? t.adminLeave : t.adminLogin}
                 >
                   <i className={`fas ${isAdminMode ? 'fa-sign-out-alt' : 'fa-user-shield'} text-sm`}></i> 
                   <span className="hidden sm:inline font-mono text-xs">{isAdminMode ? t.adminLeave : t.adminLogin}</span>
                 </button>
              </div>
            )}

            {user ? (
              <div className={`flex items-center gap-1 sm:gap-2 bg-slate-900/80 border border-teal-500/30 rounded-full p-1 sm:px-2 shadow-inner`}>
                <img src={user.photoURL} alt="pfp" className="w-8 h-8 rounded-full border border-teal-400" />
                <span className={`text-gray-200 hidden lg:inline text-xs font-bold`}>{user.name}</span>
                <button type="button" onClick={handleLogout} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-500/20 rounded-full transition-colors" title={t.adminLeave}>
                   <i className="fas fa-power-off"></i>
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleGoogleLogin} onMouseEnter={handleMouseEnterInteractive} onMouseLeave={handleMouseLeaveInteractive} className={`w-10 h-10 sm:w-auto sm:px-4 sm:py-2 flex items-center justify-center rounded-full font-bold transition-all shadow-md bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900`}>
                <i className="fab fa-google text-sm"></i> <span className="hidden sm:inline font-mono text-xs mx-2">{t.cloudLogin}</span>
              </button>
            )}

           
            <button type="button" onClick={() => { setIsCartOpen(true); playSynthSound(800, 'sine', 0.1); }} onMouseEnter={handleMouseEnterInteractive} onMouseLeave={handleMouseLeaveInteractive} className={`relative flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 sm:py-2 rounded-full transition-all shadow-[0_0_15px_rgba(20,184,166,0.5)] bg-teal-500 text-slate-900 hover:bg-teal-400 hover:scale-105 flex-shrink-0`}>
              <i className={`fas fa-shopping-cart text-lg`}></i>
              <span className="font-mono text-sm hidden sm:inline font-bold ml-2 mr-2">{totalQty.toString().padStart(2, '0')}</span>
              <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 font-mono text-xs font-bold rounded-full flex items-center justify-center shadow-lg bg-red-600 text-white border-2 border-[#0f172a]`}>{totalQty}</span>
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-y-0 ${lang === 'en' ? 'left-0' : 'right-0'} w-72 bg-[#1e293b] border-${lang === 'en' ? 'r' : 'l'} border-teal-500/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[100] transform transition-transform duration-300 flex flex-col ${isSideMenuOpen ? 'translate-x-0' : (lang === 'en' ? '-translate-x-full' : 'translate-x-full')}`}>
        <div className="p-5 border-b border-teal-500/20 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-teal-400 font-bold text-lg flex items-center gap-2"><i className="fas fa-list-ul"></i> {t.menu}</h3>
          <button type="button" onClick={() => setIsSideMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full border border-teal-500/20 text-teal-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4 flex-grow overflow-y-auto custom-scrollbar">
          
          <button onClick={handleProjectsClick} className="w-full flex items-center gap-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 p-4 rounded-xl hover:bg-blue-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
            <i className="fa-solid fa-diagram-project text-2xl"></i> 
            <span className="text-sm">{t.projects}</span>
          </button>

          <button onClick={() => { handleInstallApp(); setIsSideMenuOpen(false); }} className="w-full flex items-center gap-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 p-4 rounded-xl hover:bg-teal-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
            <i className="fas fa-download text-2xl"></i> 
            <span className="text-sm">{t.installApp}</span>
          </button>
          
          <a href="https://wa.me/9647760599953" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl hover:bg-green-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
            <i className="fab fa-whatsapp text-2xl"></i> 
            <span className="text-sm">{t.whatsappSupport}</span>
          </a>

          {externalLinks.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 bg-purple-500/10 border border-purple-500/30 text-purple-400 p-4 rounded-xl hover:bg-purple-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
               <i className="fa-solid fa-arrow-up-right-from-square text-2xl"></i>
               <span className="text-sm">{link.title}</span>
            </a>
          ))}

         
          <div className="mt-auto pt-4 border-t border-teal-500/20">
             <button onClick={() => { alert('الحمد لله الذي علّم بالقلم، والشكر موصول لرسوله الأعظم وعترته الطاهرة، ينابيع الحكمة وأصل كل علم، من أشرقت بأنوار معارفهم عقول البشر، وقامت على فيض علومهم حضارات الأمم'); setIsSideMenuOpen(false); playSynthSound(600, 'sine', 0.1); }} className="w-full flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl hover:bg-yellow-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
                <i className="fa-solid fa-hands-praying text-2xl"></i>
                <span className="text-sm">شكرا</span>
             </button>
          </div>
        </div>
      </div>
      
      {isSideMenuOpen && (
        <div onClick={() => setIsSideMenuOpen(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[90] transition-opacity"></div>
      )}

      {isAdminMode && user?.uid === ADMIN_UID ? (
        <AdminPanel 
          products={products} setProducts={setProducts}
          handleSaveProduct={handleSaveProduct} handleDeleteProduct={handleDeleteProduct} handleEditClick={handleEditClick}
          newProdName={newProdName} setNewProdName={setNewProdName}
          newProdPrice={newProdPrice} setNewProdPrice={setNewProdPrice}
          newProdImg={newProdImg} setNewProdImg={setNewProdImg}
          newProdDesc={newProdDesc} setNewProdDesc={setNewProdDesc} 
          newProdImages={newProdImages} setNewProdImages={setNewProdImages} 
          newProdStock={newProdStock} setNewProdStock={setNewProdStock} 
          newProdOrderIndex={newProdOrderIndex} setNewProdOrderIndex={setNewProdOrderIndex}
          newProdCategory={newProdCategory} setNewProdCategory={setNewProdCategory}
          categories={categories}
          handleAddCategory={handleAddCategory}
          handleDeleteCategory={handleDeleteCategory}
          handleEditCategory={handleEditCategory}
          newProdChip={newProdChip} setNewProdChip={setNewProdChip}
          newProdCode={newProdCode} setNewProdCode={setNewProdCode}
          
          newProdCompatLink={newProdCompatLink} setNewProdCompatLink={setNewProdCompatLink}
          newProdCompatIds={newProdCompatIds} setNewProdCompatIds={setNewProdCompatIds}
          newProdLibLink={newProdLibLink} setNewProdLibLink={setNewProdLibLink}
          newProdCodeSnippet={newProdCodeSnippet} setNewProdCodeSnippet={setNewProdCodeSnippet}
          
          projectsList={projectsList} setProjectsList={setProjectsList} fetchProjectsData={fetchProjectsData}
          
          externalLinks={externalLinks} setExternalLinks={setExternalLinks}

          editProdId={editProdId}
          orders={orders} fetchOrders={fetchOrders}
          handleDeleteOrder={handleDeleteOrder} 
          handleCancelOrder={handleCancelOrder}
          handleCompleteOrder={handleCompleteOrder} 
          visitorCount={visitorCount}
          handleResetVisitors={handleResetVisitors} 
          deliveryLocations={deliveryLocations} 
          setDeliveryLocations={setDeliveryLocations} 
          

          cartAnnouncement={cartAnnouncement}
          handleSaveCartAnnouncement={handleSaveCartAnnouncement}
        />
      ) : (
        <div className="flex-grow flex flex-col w-full">
          <section className="min-h-auto flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-32 pb-10 relative overflow-hidden">
            <span className={`text-6xl sm:text-7xl font-bold tracking-tighter uppercase m-auto p-4 sm:p-7 leading-none text-[#4ef542]`}>M <span className="text-[#ff8800]">S</span> A</span>
            <span className="font-mono text-lg sm:text-2xl tracking-[0.04em] mb-3 text-teal-400 animate-deep-pulse">{t.heroSub}</span>
            
            <h1 className="text-4xl md:text-8xl font-cairo-black uppercase leading-tight relative z-10 flex items-center justify-center flex-wrap">
              <span className="scanline-text text-white mx-2">{t.heroTitle1}</span> 
              <span className="robot-gradient-scanline mx-4 robot-glow-container text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  {t.heroTitle2}
              </span> 
              <span className="scanline-text text-white mx-2">{t.heroTitle3}</span>
            </h1>
            <p className="max-w-xl m-auto p-4 sm:p-6 text-xs sm:text-lg mb-2 font-light text-gray-300">
              {t.heroDesc}
            </p>
            <div ref={magneticContainerRef} className="p-4 sm:p-10 cursor-pointer">
              <button type="button" ref={magneticBtnRef} onClick={() => document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' })} className={`relative px-6 py-3 sm:px-10 sm:py-5 bg-transparent border rounded-full text-sm uppercase tracking-widest overflow-hidden group transition-all duration-300 shadow-sm border-teal-500/30 text-teal-400 hover:border-teal-400 hover:text-slate-900`}>
                <span className="relative z-10 font-bold flex items-center gap-3 transition-colors duration-300">
                  <i className="fas fa-arrow-down animate-bounce"></i> {t.browseCat}
                </span>
                <div className="absolute inset-0 bg-teal-400 scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 ease-out z-0"></div>
              </button>
            </div>
          </section>

          <section className={`max-w-7xl mx-auto px-2 sm:px-4 py-4 border-t border-teal-500/10 flex-grow w-full`} id="productsSection">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 px-2">
              <div>
                <h2 className={`text-2xl md:text-5xl font-extrabold tracking-tight mt-2 text-white`}>{t.catTitle}</h2>
              </div>
              <p className={`max-w-sm text-xs sm:text-sm font-mono text-gray-400`}>{t.catDesc}</p>
            </div>

            <div className="mb-6 relative w-full md:w-1/2 lg:w-1/3 px-2">
              <div className={`absolute inset-y-0 ${lang === 'en' ? 'left-4' : 'right-4'} flex items-center pointer-events-none`}>
                <i className="fas fa-search text-teal-600"></i>
              </div>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onMouseEnter={handleMouseEnterInteractive} 
                onMouseLeave={handleMouseLeaveInteractive}
                className={`w-full p-3 sm:p-4 ${lang === 'en' ? 'pl-12' : 'pr-12'} rounded-2xl text-xs sm:text-sm outline-none transition-all border border-teal-500 bg-white text-slate-900 placeholder-gray-500 shadow-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-300`}
              />
            </div>

            <div className={`flex flex-wrap gap-2 mb-6 px-2 justify-center md:justify-start custom-scrollbar ${searchQuery !== '' ? 'opacity-50 pointer-events-none' : ''}`}>
               <button 
                  onClick={() => setSelectedCatFilter('')} 
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-mono text-xs border whitespace-nowrap transition-all shadow-sm ${selectedCatFilter === '' ? 'bg-teal-500 text-slate-900 font-bold border-teal-500' : 'bg-slate-800/60 text-gray-300 border-teal-500/20 hover:border-teal-400'}`}
               >
                  All / الكل
               </button>
               {categories.map(c => (
                   <button 
                      key={c.id} 
                      onClick={() => setSelectedCatFilter(c.name)} 
                      className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-mono text-xs border whitespace-nowrap transition-all shadow-sm ${selectedCatFilter === c.name ? 'bg-teal-500 text-slate-900 font-bold border-teal-500' : 'bg-slate-800/60 text-gray-300 border-teal-500/20 hover:border-teal-400'}`}
                   >
                      {c.name}
                   </button>
               ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 items-stretch pb-12 w-full px-1 sm:px-2">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 sm:col-span-3 lg:col-span-4 text-center py-16 border rounded-2xl border-dashed border-teal-500/20 bg-slate-800/40 mx-2">
                  <i className="fas fa-microchip text-3xl sm:text-5xl text-teal-500/30 mb-4 animate-pulse"></i>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-300">{t.notFoundTitle}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">{t.notFoundDesc}</p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const stockCount = parseInt(prod.stock) || 0;
                  const isOutOfStock = stockCount <= 0;
                  const prodInCartQty = cart.find(item => item.id === prod.id)?.qty || 0;

                  return (
                  <div key={prod.id} className="card-perspective h-full w-full min-w-0">
                    <div 
                      onMouseMove={(e) => handleCardMove(e, e.currentTarget)}
                      onMouseLeave={(e) => handleCardLeave(e.currentTarget)}
                      onMouseEnter={handleMouseEnterInteractive} 
                      onClick={() => { setSelectedProduct(prod); setActiveImageIndex(0); setModalTab('compat'); setModalQty(1); setModalQtyWarning(''); playSynthSound(800, 'sine', 0.1); resetInactivityTimer(); }}
                      className={`card-tilt cursor-pointer h-full w-full flex flex-col rounded-xl sm:rounded-2xl p-3 sm:p-5 relative group transition-all duration-300 border bg-neutral-900/40 overflow-hidden break-words min-w-0 ${isOutOfStock ? 'border-red-500/20 hover:border-red-400/60' : 'border-teal-500/20 hover:border-teal-400/60'}`}
                    >
                      <div className="gloss-effect"></div>
                      
                      <div 
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); setActiveImageIndex(0); setModalTab('compat'); setModalQty(1); setModalQtyWarning(''); playSynthSound(800, 'sine', 0.1); resetInactivityTimer(); }}
                        className={`flex-shrink-0 h-28 sm:h-48 w-full rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-5 flex items-center justify-center border transition-all duration-300 relative cursor-pointer bg-white ${isOutOfStock ? 'border-red-500/10 group-hover:border-red-500/30' : 'border-teal-500/10 group-hover:border-teal-500/30'}`}
                        title={t.viewDetails}
                      >
                        <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} loading="lazy" decoding="async" alt={prod.name} className={`object-contain h-full w-full max-h-full max-w-full mix-blend-multiply transition-all duration-500 p-2 ${isOutOfStock ? 'opacity-50 grayscale' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
                        
                        {prod.images && prod.images.length > 1 && (
                           <div className={`absolute bottom-1 sm:bottom-2 ${lang === 'en' ? 'left-1 sm:left-2' : 'right-1 sm:right-2'} px-1 py-0.5 sm:px-2 sm:py-1 bg-slate-900/80 text-white rounded text-[8px] sm:text-xs font-mono shadow-md backdrop-blur-sm`}>
                              <i className="fas fa-images"></i> +{prod.images.length - 1}
                           </div>
                        )}

                        <div className={`absolute top-1 sm:top-2 ${lang === 'en' ? 'right-1 sm:right-2' : 'left-1 sm:left-2'} px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[8px] sm:text-xs font-mono font-bold bg-teal-500/20 text-teal-600 border border-teal-500/30`}>{prod.chip || 'NEW MCU'}</div>
                        
                        {isOutOfStock && (
                           <div className="absolute inset-0 bg-slate-900/60 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                              <span className="bg-red-600 text-white font-bold px-2 py-1 sm:px-6 sm:py-2 rounded border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -rotate-12 text-[10px] sm:text-lg uppercase tracking-widest">
                                نافذ
                              </span>
                           </div>
                        )}

                        <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-slate-900/80 text-white font-bold text-[10px] sm:text-xs px-2 py-1 sm:px-4 sm:py-2 rounded-full tracking-widest"><i className="fas fa-eye"></i> {t.viewDetails}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-2 flex-shrink-0 min-w-0 gap-1 w-full overflow-hidden">
                        <span className={`font-mono text-[9px] sm:text-[10px] tracking-widest font-bold text-teal-500 truncate`}>// {prod.code || 'GENERIC'}</span>
                        {prod.category && (
                          <span className={`font-mono text-[9px] sm:text-[10px] bg-teal-500/10 text-teal-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-teal-500/20 truncate`}>{prod.category}</span>
                        )}
                      </div>

                      <h3 className={`text-[11px] sm:text-lg font-bold leading-snug mb-1 sm:mb-2 line-clamp-2 flex-shrink-0 cursor-pointer text-white hover:text-teal-400 transition-colors break-words min-w-0 w-full`} onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); setActiveImageIndex(0); setModalTab('compat'); setModalQty(1); setModalQtyWarning(''); playSynthSound(800, 'sine', 0.1); resetInactivityTimer(); }}>{prod.name}</h3>
                      
                      <p className={`text-[9px] sm:text-sm mb-3 sm:mb-5 leading-relaxed line-clamp-2 text-gray-300 flex-grow break-words min-w-0 w-full`}>{prod.desc || t.noDesc}</p>
                      
                      <div className={`mt-auto flex flex-col justify-between items-stretch sm:items-end pt-2 sm:pt-4 border-t gap-2 sm:gap-0 flex-shrink-0 w-full z-10 ${isOutOfStock ? 'border-red-500/10' : 'border-teal-500/10'} min-w-0`}>
                        <div className="w-full text-center sm:text-right min-w-0">
                           <span className="block text-[8px] sm:text-[10px] text-gray-400 font-mono font-bold truncate">{t.price}</span>
                           <span className={`text-xs sm:text-xl font-bold font-mono truncate block ${isOutOfStock ? 'text-red-400 opacity-60' : 'text-teal-400'}`}>{prod.price?.toLocaleString() || 0}</span>
                        </div>
                        <button 
                          type="button" 
                          disabled={isOutOfStock}
                          onClick={(e) => { e.stopPropagation(); addToCart(prod.id, prod.name, prod.price, prod.images && prod.images.length > 0 ? prod.images[0] : prod.img, prod.stock); resetInactivityTimer(); }} 
                          className={`w-full flex items-center justify-center gap-1 p-1.5 sm:p-2 sm:px-4 rounded-full font-bold text-[9px] sm:text-xs transition-all relative overflow-hidden z-20 shadow-md ${isOutOfStock ? 'bg-slate-700 text-gray-400 cursor-not-allowed border border-slate-600' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}
                        >
                          <i className="fas fa-cart-arrow-down"></i> <span className="truncate">{isOutOfStock ? 'نافذ' : t.addToCart}</span>
                          
                  
                          {prodInCartQty > 0 && (
                              <span className="absolute left-1 bg-slate-900 text-teal-400 text-[10px] font-mono px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                  {prodInCartQty}
                              </span>
                          )}
                        </button>
                      </div>
                      
                    </div>
                  </div>
                )})
              )}
            </div>
          </section>
        </div>
      )}

      <footer className="w-full bg-[#0b1120] border-t border-teal-500/20 py-8 flex flex-col items-center justify-center mt-auto">
         <div className="text-center">
            <p className="text-gray-400 font-mono text-sm tracking-wider">جميع الحقوق محفوظة لدى MSA &copy; 2026</p>
         </div>
      </footer>

 
      <div className={`fixed inset-y-0 ${lang === 'en' ? 'right-0' : 'left-0'} w-full md:w-[850px] border-${lang === 'en' ? 'l' : 'r'} shadow-2xl z-50 transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : (lang === 'en' ? 'translate-x-full' : '-translate-x-full')} bg-[#0f172a] border-teal-500/20`}>
        <div className={`p-5 border-b flex justify-between items-center bg-slate-900/60 border-teal-500/20`}>
          <div className="flex items-center gap-5">
            <i className={`fas fa-shopping-cart text-xl text-teal-400`}></i>
            <div><h3 className={`text-lg font-bold text-white`}>{t.cartTitle}</h3></div>
          </div>
          <button type="button" onClick={() => { setIsCartOpen(false); playSynthSound(400, 'sine', 0.1); }} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors border-teal-500/20 hover:bg-slate-800`}>
            <i className={`fas fa-times text-teal-400 text-lg`}></i>
          </button>
        </div>

        {/* --- إعلان السلة يظهر هنا إذا لم يكن فارغاً --- */}
        {cartAnnouncement && (
          <div className={`bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-3 sm:p-4 flex items-center gap-3 shrink-0`}>
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/30">
                <i className="fa-solid fa-bullhorn text-yellow-400 text-sm animate-pulse"></i>
            </div>
            <p className="text-yellow-400 text-xs sm:text-sm font-bold whitespace-pre-wrap leading-relaxed flex-grow">
               {cartAnnouncement}
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse md:flex-row flex-grow overflow-y-auto overflow-x-hidden md:overflow-hidden custom-scrollbar">
          
          <div className={`w-full md:w-2/5 flex flex-col flex-shrink-0 h-auto md:h-full md:border-${lang === 'en' ? 'l' : 'r'} border-teal-500/10 bg-slate-800/30`}>
            <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
              <h4 className="font-bold text-teal-400 text-sm mb-4"><i className="fas fa-user-astronaut"></i> {t.cartInfo}</h4>
              <input type="text" placeholder={t.cartName} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400`} />
              <input type="tel" placeholder={t.cartPhone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400`} />
              <input type="tel" placeholder={t.cartPhone2} value={customerPhone2} onChange={(e) => setCustomerPhone2(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400`} />
              
              <select 
                 value={selectedGovId} 
                 onChange={e => setSelectedGovId(e.target.value)} 
                 className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400`}
              >
                 <option value="" disabled>اختر المحافظة</option>
                 {deliveryLocations.map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name} ({Number(gov.price).toLocaleString()} د.ع)</option>
                 ))}
              </select>

              <textarea placeholder={t.cartAddress} value={detailedAddress} onChange={(e) => setDetailedAddress(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400 min-h-[80px] resize-none`}></textarea>
            </div>

            <div className={`p-4 border-t space-y-4 bg-slate-800/40 border-teal-500/20`}>
              <div className={`flex justify-between font-mono text-sm font-bold text-gray-300`}><span>{t.cartSub}</span><span>{subtotal.toLocaleString()} {t.currency}</span></div>
              <div className={`flex justify-between font-mono text-sm font-bold text-gray-300`}><span>{t.cartDelivery}</span><span>{currentDeliveryFee.toLocaleString()} {t.currency}</span></div>
              
              {selectedGovId && (
                 <div className={`flex justify-between font-mono text-xs text-teal-300`}>
                    <span>{t.cartTime}</span><span>{activeGov.time}</span>
                 </div>
              )}

              <div className={`flex justify-between text-xl font-bold pt-2 border-t text-white border-teal-500/10`}>
                 <span>{t.cartTotal}</span>
                 <span className={`font-mono text-teal-400`}>{(subtotal + currentDeliveryFee).toLocaleString()} {t.currency}</span>
              </div>
              
              <div className="flex gap-2 mt-2 w-full">
                <button type="button" onClick={handleCheckout} className="flex-grow py-3 sm:py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 hover:from-teal-400 hover:to-emerald-400 font-extrabold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <i className="fas fa-check-double text-base sm:text-lg"></i> {t.cartCheckout}
                </button>
                <button type="button" onClick={() => { 
                    if(window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء الطلب وإفراغ السلة؟' : 'Are you sure you want to clear the cart?')) {
                        setCart([]); 
                        setIsCartOpen(false); 
                        playSynthSound(400, 'sawtooth', 0.2); 
                    }
                }} className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 font-extrabold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <i className="fa-solid fa-trash-can text-base sm:text-lg"></i> {t.cancelOrder}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/5 flex flex-col flex-shrink-0 h-auto md:h-full bg-transparent border-b md:border-b-0 border-teal-500/20">
            <div className="p-4 border-b border-teal-500/10 flex justify-between items-center bg-slate-800/40">
              <span className="font-bold text-teal-400 text-sm"><i className="fas fa-box-open"></i> {t.cartItems}</span>
              <span className="font-mono text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded border border-teal-500/30">{cart.length} {t.itemCount}</span>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar max-h-[45vh] md:max-h-none">
              {cart.length === 0 ? (
                <div className={`h-full flex flex-col justify-center items-center text-center font-mono text-gray-400`}>
                  <i className="fas fa-ghost text-4xl mb-4 text-teal-500/20 animate-bounce"></i>
                  <p>{t.cartEmpty}</p>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={item.id || i} className={`border rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center shadow-sm hover:border-teal-500/40 transition-colors bg-slate-800/60 border-teal-500/10`}>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg p-1 flex-shrink-0 border border-teal-500/20 flex items-center justify-center overflow-hidden">
                      <img src={item.image} loading="lazy" decoding="async" alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm line-clamp-1 text-white truncate break-words`}>{item.name}</h4>
                      <span className={`font-mono text-[10px] sm:text-xs font-bold mt-1 block text-teal-400`}>{Number(item.price).toLocaleString()} {t.currency}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-1 border rounded-lg px-1 py-1 bg-slate-900/60 border-teal-500/30`}>
                        <button type="button" onClick={() => updateQty(item.id, 1)} className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-xs font-bold transition-colors text-teal-400 hover:bg-teal-500/20`}>+</button>
                        <input 
                          type="number" 
                          min="0"
                          value={item.qty}
                          onChange={(e) => setItemQty(item.id, e.target.value)}
                          className={`w-8 sm:w-10 text-center font-mono text-xs sm:text-sm font-bold outline-none bg-transparent text-white`}
                          style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                        />
                        <button type="button" onClick={() => updateQty(item.id, -1)} className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-xs font-bold transition-colors text-red-400 hover:bg-red-500/20`}>-</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isCartOpen && <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 transition-opacity"></div>}

    
      {selectedProduct && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-6 transition-opacity duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" 
            onClick={() => { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }}
          ></div>
          
          <div className={`relative w-full max-w-5xl max-h-[95vh] overflow-y-auto md:overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row transform transition-transform duration-300 scale-100 bg-[#0f172a] border border-teal-500/30`}>
            <button 
              type="button"
              onClick={() => { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }} 
              className={`absolute top-4 ${lang === 'en' ? 'left-4' : 'right-4'} z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all bg-slate-900/60 border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-slate-900`}
            >
              <i className="fas fa-times text-sm sm:text-lg"></i>
            </button>

          
            <div className={`w-full md:w-5/12 p-1 sm:p-8 flex flex-col items-center justify-start sm:justify-center border-b md:border-b-0 md:border-${lang === 'en' ? 'r' : 'l'} border-teal-500/20 bg-[#0b1120] flex-shrink-0 md:flex-shrink`}>
              
              <div 
                  className="w-full h-64 sm:h-80 md:h-[26rem] shrink-0 bg-white rounded-3xl p-4 sm:p-8 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] relative overflow-hidden border-4 border-slate-800 group cursor-pointer"
                  onClick={() => {
                      let allImgs = [];
                      if (selectedProduct.images && selectedProduct.images.length > 0) {
                          allImgs = selectedProduct.images;
                      } else if (selectedProduct.img) {
                          allImgs = [selectedProduct.img];
                      }
                      if (allImgs.length > 0) {
                          setActiveGallery({ list: allImgs, index: activeImageIndex, title: selectedProduct.name });
                          playSynthSound(800, 'sine', 0.1);
                      }
                  }}
              >
                  {selectedProduct.images?.length > 1 && (
                      <button 
                          onClick={(e) => { 
                              e.stopPropagation(); 
                              setActiveImageIndex(prev => prev === 0 ? selectedProduct.images.length - 1 : prev - 1); 
                              playSynthSound(1000, 'triangle', 0.05);
                          }} 
                          className="absolute left-2 sm:left-4 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-900/40 text-slate-800 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all backdrop-blur-md"
                      >
                          <i className="fas fa-chevron-left text-lg"></i>
                      </button>
                  )}

                  <img 
                      src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[activeImageIndex] : selectedProduct.img} 
                      loading="lazy"
                      decoding="async"
                      alt={selectedProduct.name} 
                      className={`object-contain h-full w-full mix-blend-multiply transition-transform duration-500 group-hover:scale-110 ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'opacity-50 grayscale' : ''}`} 
                  />
                  
                  {selectedProduct.images?.length > 1 && (
                      <button 
                          onClick={(e) => { 
                              e.stopPropagation(); 
                              setActiveImageIndex(prev => prev === selectedProduct.images.length - 1 ? 0 : prev + 1); 
                              playSynthSound(1000, 'triangle', 0.05);
                          }} 
                          className="absolute right-2 sm:right-4 z-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-900/40 text-slate-800 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all backdrop-blur-md"
                      >
                          <i className="fas fa-chevron-right text-lg"></i>
                      </button>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-teal-900/5 backdrop-blur-[1px] z-10 pointer-events-none rounded-2xl">
                      <i className="fa-solid fa-expand text-5xl text-teal-600 drop-shadow-xl"></i>
                  </div>

                  <div className={`absolute top-2 ${lang === 'en' ? 'right-2' : 'left-4'} px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 z-20 shadow-sm`}>
                      {selectedProduct.chip || 'NEW MCU'}
                  </div>
                  
                  {(parseInt(selectedProduct.stock)||0) <= 0 && (
                     <div className="absolute inset-0 bg-white/60 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-2 rounded border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -rotate-12 text-sm sm:text-lg uppercase tracking-widest">
                          نافذ
                        </span>
                     </div>
                  )}
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-6 overflow-x-auto w-full pb-2 custom-scrollbar justify-center shrink-0">
                  {selectedProduct.images.map((img, idx) => {
                    if(!img || img.trim() === '') return null;
                    return (
                      <button 
                        type="button"
                        key={idx} 
                        onClick={() => { setActiveImageIndex(idx); playSynthSound(1000, 'triangle', 0.05); }}
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border-2 p-1 overflow-hidden transition-all duration-300 ${activeImageIndex === idx ? 'border-teal-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:border-teal-300'}`}
                      >
                        <img src={img} loading="lazy" decoding="async" alt="" className="object-contain w-full h-full mix-blend-multiply" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

      
            <div className="w-full md:w-7/12 p-2 sm:p-8 flex flex-col justify-start h-auto md:h-auto flex-1 bg-slate-900/50">
              
           
              <div className="mb-4 flex flex-col gap-4">
                
           
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-xl sm:text-3xl font-black mb-2 text-white break-words`}>{selectedProduct.name}</h2>
                    <div className="flex gap-1 text-xs sm:text-sm text-yellow-500">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                  </div>

                  <div className="flex flex-row items-center bg-[#0a0a0f] p-2 sm:p-3 rounded-xl border border-teal-500/20 shadow-inner shrink-0 gap-3">
                      <span className="text-gray-300 font-mono font-bold text-sm uppercase tracking-widest whitespace-nowrap">
                          {t.price}
                      </span>
                      <div className="flex flex-row items-center gap-2">
                          <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'text-red-400 opacity-60' : 'text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]'}`}>
                              {selectedProduct.price?.toLocaleString() || 0}
                          </span>
                          <span className="bg-teal-500/10 border border-teal-500/30 px-2 py-1 rounded-lg text-teal-400 font-bold text-xs sm:text-sm whitespace-nowrap">
                              {t.currency}
                          </span>
                      </div>
                  </div>
                </div>

              
                {(() => {
                    const currentCartQty = cart.find(item => item.id === selectedProduct.id)?.qty || 0;
                    const availableStock = Math.max(0, (parseInt(selectedProduct.stock)||0) - currentCartQty);
                    
                    return (
                        <div className="bg-[#0b101a] border border-teal-500/20 p-4 rounded-xl shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <span className="text-gray-400 font-bold text-xs sm:text-sm flex items-center gap-2">
                                    <i className="fas fa-layer-group"></i> الكمية المطلوبة:
                                </span>
                                {modalQtyWarning && (
                                    <span className="text-red-400 text-xs font-bold animate-pulse">
                                        <i className="fas fa-exclamation-triangle"></i> {modalQtyWarning}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 bg-[#0a0a0f] border rounded-xl px-2 py-1 ${availableStock <= 0 ? 'border-red-500/30 opacity-50' : 'border-teal-500/30'}`}>
                                    <button 
                                        type="button" 
                                        disabled={availableStock <= 0}
                                        onClick={() => handleModalQtyChange(1, availableStock)} 
                                        className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-slate-900 transition-colors font-bold text-xl flex items-center justify-center disabled:cursor-not-allowed"
                                    >+</button>
                                    
                                    <input 
                                        type="text" 
                                        value={availableStock <= 0 ? '0' : modalQty} 
                                        readOnly 
                                        className="w-14 text-center bg-transparent text-white font-mono font-bold text-xl outline-none pointer-events-none" 
                                    />
                                    
                                    <button 
                                        type="button" 
                                        disabled={availableStock <= 0 || modalQty <= 1}
                                        onClick={() => handleModalQtyChange(-1, availableStock)} 
                                        className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-900 transition-colors font-bold text-xl flex items-center justify-center disabled:cursor-not-allowed"
                                    >-</button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

        
                <button 
                    type="button" 
                    disabled={(parseInt(selectedProduct.stock)||0) <= 0 || ((parseInt(selectedProduct.stock)||0) - (cart.find(item => item.id === selectedProduct.id)?.qty || 0)) <= 0}
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        addToCart(selectedProduct.id, selectedProduct.name, selectedProduct.price, (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0] : selectedProduct.img, selectedProduct.stock, modalQty); 
                        setModalQty(1);
                        resetInactivityTimer();
                    }} 
                    className={`relative overflow-hidden w-full py-3 sm:py-4 rounded-xl font-black text-lg sm:text-xl tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${((parseInt(selectedProduct.stock)||0) - (cart.find(item => item.id === selectedProduct.id)?.qty || 0)) <= 0 ? 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-900 hover:from-teal-400 hover:to-emerald-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:-translate-y-1 shadow-[0_4px_15px_rgba(0,0,0,0.2)]'}`}
                >
                    <i className="fas fa-cart-plus text-2xl"></i> 
                    {((parseInt(selectedProduct.stock)||0) - (cart.find(item => item.id === selectedProduct.id)?.qty || 0)) <= 0 ? 'المنتج نافذ من المخزن' : t.addToCart}

                
                    {cart.find(item => item.id === selectedProduct.id)?.qty > 0 && (
                        <span className="absolute left-4 bg-slate-900/90 text-teal-400 text-xs sm:text-sm font-mono px-3 py-1.5 rounded-lg border border-teal-500/50 shadow-lg flex items-center gap-1 animate-pulse">
                            <i className="fas fa-check-circle"></i> الكمية: {cart.find(item => item.id === selectedProduct.id).qty}
                        </span>
                    )}
                </button>

                {/* التبويبات */}
                <div className="flex gap-3 sm:gap-6 border-b border-teal-500/20 mt-2 overflow-x-auto custom-scrollbar flex-shrink-0">
                    <button onClick={() => setModalTab('compat')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'compat' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        <i className="fa-solid fa-puzzle-piece ml-1"></i> متوافق مع
                    </button>
                    <button onClick={() => setModalTab('desc')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'desc' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        <i className="fa-solid fa-circle-info ml-1"></i> الشرح والتفاصيل
                    </button>
                    <button onClick={() => setModalTab('code')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'code' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        <i className="fa-solid fa-code ml-1"></i> الكود البرمجي
                    </button>
                    <button onClick={() => setModalTab('links')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'links' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        <i className="fa-solid fa-paperclip ml-1"></i> الملحقات
                    </button>
                </div>
              </div>
              
              {/* === محتوى التبويبات === */}
              <div className="flex-grow flex flex-col mb-0 pb-4 min-h-[200px] overflow-y-auto custom-scrollbar overscroll-contain max-h-[45vh] sm:max-h-[55vh]">
                  {modalTab === 'compat' && (
                      <div className="flex flex-wrap gap-3 h-fit min-h-full p-2">
                          {(() => {
                              const compatIds = selectedProduct.compatProdIds || (selectedProduct.compatProdId ? [selectedProduct.compatProdId] : []);
                              if (compatIds.length === 0) {
                                  return <div className="p-4 w-full border border-dashed border-gray-600/50 rounded-xl text-gray-500 text-sm text-center">لا توجد منتجات متوافقة مضافة حالياً.</div>;
                              }
                              return compatIds.map(id => {
                                  const compProd = products.find(p => p.id === id);
                                  if(!compProd) return null;
                                  return (
                                      <div 
                                          key={id}
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedProduct(compProd);
                                              setActiveImageIndex(0);
                                              setModalTab('compat');
                                              setModalQty(1);
                                              setModalQtyWarning('');
                                              resetInactivityTimer();
                                          }}
                                          className="cursor-pointer flex flex-col items-center bg-slate-800/60 border border-teal-500/20 rounded-xl p-3 hover:border-teal-400 hover:bg-slate-800 transition-all shadow-sm w-28 sm:w-32 shrink-0 group"
                                          title={`عرض ${compProd.name}`}
                                      >
                                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden mb-2 border border-neutral-200">
                                              <img src={compProd.images && compProd.images.length > 0 ? compProd.images[0] : compProd.img} loading="lazy" alt={compProd.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                                          </div>
                                          <span className="text-[10px] sm:text-xs font-bold text-teal-400 text-center line-clamp-2 leading-tight">{compProd.name}</span>
                                      </div>
                                  );
                              });
                          })()}
                      </div>
                  )}

                  {modalTab === 'desc' && (
                      <div className={`p-4 sm:p-5 rounded-xl text-xs sm:text-sm leading-relaxed border bg-slate-800/50 border-teal-500/10 text-gray-300 h-fit min-h-full break-words whitespace-pre-wrap`}>
                          {selectedProduct.desc || t.noDesc}
                      </div>
                  )}
                  
                  {modalTab === 'code' && (
                      <div className="bg-[#0a0a0f] p-4 rounded-xl border border-teal-500/20 overflow-x-auto text-left h-fit min-h-full shadow-inner" dir="ltr">
                          <pre className="text-teal-300 font-mono text-xs sm:text-sm">
                              {selectedProduct.codeSnippet || '// لا يوجد كود برمجي متاح لهذه القطعة حالياً.\n// يمكنك إضافة الكود من لوحة الإدارة.'}
                          </pre>
                      </div>
                  )}

                  {modalTab === 'links' && (
                      <div className="flex flex-col gap-4 h-fit min-h-full">
                          {selectedProduct.compatLink ? (
                              <a href={selectedProduct.compatLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm group">
                                  <span className="font-bold text-sm"><i className="fa-solid fa-link ml-2"></i> مادة تتوافق معه (رابط خارجي)</span>
                                  <i className="fa-solid fa-arrow-up-right-from-square group-hover:scale-110 transition-transform"></i>
                              </a>
                          ) : null}
                          
                          {selectedProduct.libLink ? (
                              <a href={selectedProduct.libLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm group">
                                  <span className="font-bold text-sm"><i className="fa-solid fa-book-bookmark ml-2"></i> تحميل مكتبة الحساس / القطعة</span>
                                  <i className="fa-solid fa-arrow-up-right-from-square group-hover:scale-110 transition-transform"></i>
                              </a>
                          ) : null}

                          {(!selectedProduct.compatLink && !selectedProduct.libLink) && (
                              <div className="p-4 border border-dashed border-gray-600/50 rounded-xl text-gray-500 text-sm text-center">لا توجد ملحقات خارجية أو مكتبات مضافة حالياً.</div>
                          )}
                      </div>
                  )}
              </div>

            </div>
          </div>
        </div>
      )}

   
      {isProjectsModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-6 transition-opacity duration-300">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setIsProjectsModalOpen(false)}></div>
           <div className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-[#0f172a] border border-teal-500/30 rounded-3xl shadow-2xl overflow-hidden">
               <div className="flex justify-between items-center p-5 border-b border-teal-500/20 bg-slate-800/50">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                     <i className="fa-solid fa-diagram-project text-blue-500"></i> معرض المشاريع المنجزة
                  </h2>
                  <button onClick={() => setIsProjectsModalOpen(false)} className="w-10 h-10 rounded-full border border-teal-500/30 bg-slate-900/60 text-teal-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex justify-center items-center">
                     <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
               </div>
               
               <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                  {projectsList.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <i className="fa-solid fa-folder-open text-6xl text-teal-500/20 mb-4"></i>
                        <h3 className="text-xl font-bold text-gray-300">جاري تحميل المشاريع...</h3>
                        <p className="text-gray-500 mt-2 text-sm">سيتم عرض المشاريع المنجزة هنا قريباً.</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectsList.map((proj) => (
                           <div key={proj.id} className="bg-slate-800/40 border border-teal-500/20 rounded-2xl p-5 hover:border-teal-500/50 transition-all flex flex-col h-full group overflow-hidden relative shadow-lg">
                              {proj.img && (
                                <div 
                                    className="w-full h-48 mb-4 overflow-hidden rounded-xl border border-teal-500/30 relative cursor-pointer group/img bg-white shrink-0" 
                                    onClick={() => {
                                        let allImgs = [];
                                        if (proj.img) allImgs.push(proj.img);
                                        if (proj.images && Array.isArray(proj.images)) {
                                            allImgs = [...allImgs, ...proj.images];
                                        }
                                        if (allImgs.length > 0) {
                                            setActiveGallery({ list: allImgs, index: 0, title: proj.name });
                                            playSynthSound(800, 'sine', 0.1);
                                        }
                                    }}
                                >
                      
                                  <img src={proj.img} decoding="async" alt={proj.name} className="w-full h-full object-contain mix-blend-multiply group-hover/img:scale-110 transition-transform duration-700 p-2" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60 pointer-events-none"></div>
                                  
                                  {proj.images && proj.images.length > 0 && (
                                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-xs px-2 py-1 rounded-md border border-white/10 backdrop-blur-md z-10">
                                          <i className="fa-regular fa-images"></i> +{proj.images.length}
                                      </div>
                                  )}

                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 bg-teal-900/20 backdrop-blur-[2px]">
                                     <i className="fa-solid fa-expand text-4xl text-white drop-shadow-xl"></i>
                                  </div>
                                </div>
                              )}
                              <div className="mb-4">
                                 <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 inline-block mb-3">
                                    {proj.category || 'عام'}
                                 </span>
                                 <h3 className="text-xl font-black text-white mb-2 break-words">{proj.name}</h3>
                                 <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 break-words">{proj.desc}</p>
                              </div>
                              <div className="mt-auto pt-4 border-t border-teal-500/10 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                                 <span className="text-xs text-teal-500 font-mono"><i className="fa-solid fa-check-circle"></i> مكتمل</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
           </div>
        </div>
      )}

    
      {activeGallery && (
        <div className="fixed inset-0 z-[9999999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl transition-opacity duration-300">
           
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent">
                <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-md truncate max-w-[80%] pr-2">{activeGallery.title}</h3>
                <button onClick={() => { setActiveGallery(null); playSynthSound(400, 'sine', 0.1); }} className="text-white hover:text-red-500 transition-colors bg-white/10 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center backdrop-blur-md hover:bg-red-500/20 flex-shrink-0">
                    <i className="fas fa-times text-xl sm:text-2xl"></i>
                </button>
            </div>

           
            <div className="relative w-full max-w-6xl h-[60vh] sm:h-[70vh] flex items-center justify-center mb-4 mt-12 sm:mt-16">
                {activeGallery.list.length > 1 && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setActiveGallery(prev => ({...prev, index: prev.index === 0 ? prev.list.length - 1 : prev.index - 1}));
                        playSynthSound(1000, 'triangle', 0.05);
                    }} className="absolute left-2 sm:left-10 z-10 w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-black/50 text-white rounded-full border border-teal-500/30 hover:bg-teal-500 hover:text-black transition-all hover:scale-110">
                        <i className="fas fa-chevron-left text-lg sm:text-2xl"></i>
                    </button>
                )}

                <div className="w-full h-full bg-white rounded-xl sm:rounded-3xl p-4 sm:p-8 flex items-center justify-center border-4 border-slate-800 shadow-[0_0_50px_rgba(20,184,166,0.15)] relative">
                   <img 
                       src={activeGallery.list[activeGallery.index]} 
                       className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-500" 
                       alt={`View ${activeGallery.index + 1}`} 
                   />
                </div>

                {activeGallery.list.length > 1 && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setActiveGallery(prev => ({...prev, index: prev.index === prev.list.length - 1 ? 0 : prev.index + 1}));
                        playSynthSound(1000, 'triangle', 0.05);
                    }} className="absolute right-2 sm:right-10 z-10 w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-black/50 text-white rounded-full border border-teal-500/30 hover:bg-teal-500 hover:text-black transition-all hover:scale-110">
                        <i className="fas fa-chevron-right text-lg sm:text-2xl"></i>
                    </button>
                )}
            </div>

            
            {activeGallery.list.length > 1 && (
                <div className="w-full max-w-4xl bg-slate-900/80 p-3 sm:p-4 rounded-3xl border border-teal-500/30 backdrop-blur-md flex flex-col items-center shadow-2xl shrink-0">
                    <span className="text-teal-400 font-mono text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 tracking-widest">
                        IMAGE {activeGallery.index + 1} OF {activeGallery.list.length}
                    </span>
                    <div className="flex gap-2 sm:gap-4 overflow-x-auto custom-scrollbar w-full px-2 pb-2 justify-start sm:justify-center items-center">
                        {activeGallery.list.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => {
                                    setActiveGallery(prev => ({...prev, index: idx}));
                                    playSynthSound(1200, 'triangle', 0.05);
                                }}
                                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 p-1 ${activeGallery.index === idx ? 'border-teal-400 scale-105 sm:scale-110 shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'border-transparent opacity-50 hover:opacity-100 hover:border-teal-500/50'}`}
                            >
                                <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt={`thumb ${idx}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
           
            <button
                onClick={() => { setActiveGallery(null); playSynthSound(400, 'sine', 0.1); }}
                className="absolute bottom-6 left-6 z-[999] bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 px-5 py-2.5 rounded-xl font-bold font-mono transition-all shadow-lg backdrop-blur-md flex items-center gap-2 hover:scale-105"
            >
                <i className="fas fa-times text-lg"></i> إغلاق
            </button>
        </div>
      )}

    </div>
  );
}
