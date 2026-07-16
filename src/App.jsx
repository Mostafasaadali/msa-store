import './App.css';
import {ADMIN_UID, db, auth, provider } from './firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc, updateDoc, getDoc, onSnapshot, increment } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { gsap } from 'gsap';

// التحميل المتأخر (Lazy Loading) للوحة الإدارة لتخفيف حجم الصفحة للزبائن
const AdminPanel = lazy(() => import('./AdminPanel'));

const translations = {
  ar: {
    adminLogin: "الإدارة",
    adminLeave: "خروج الإدارة",
    cloudLogin: "دخول سحابي",
    cart: "السلة",
    heroSub: "قطع ألكترونية مهندسة بدقة عالية",
    heroTitle1: "مستقبلك",
    heroTitle2: "بالروبوت",
    heroTitle3: "يبدأ هنا",
    heroDesc: "منفذك المتكامل للحصول على بوردات التحكم ومحركات السيرفو وعضلات التحكم الدقيقة. نوفر القطع بأعلى كفاءة لمشروع التخرج أو مشروعك البرمجي القادم.",
    browseCat: "تصفح كتالوج المنتجات",
    catTitle: "القطع المتاحة للفحص والطلب",
    catDesc: "اضغط فوق الصورة للقطعة لعرضها ومعاينة تفاصيل المكونات بدقة",
    searchPlaceholder: "ابحث بالاسم، الوصف، بالمودل، أو حتى السعر...",
    notFoundTitle: "لم يتم العثور على قطع تطابق بحثك",
    notFoundDesc: "جرب استخدام كلمات مفتاحية أخرى أو تحقق من السعر.",
    viewDetails: "عرض التفاصيل",
    price: "السعر",
    addToCart: "إضافة للسلة",
    cartTitle: "سلة الطلبات الرقمية",
    cartInfo: "بيانات المستلم والتوصيل",
    cartName: "اسم المستلم",
    cartPhone: "رقم الهاتف النشط",
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
    heroSub: "PRECISION ENGINEERED ORIGINAL PARTS",
    heroTitle1: "YOUR FUTURE OF",
    heroTitle2: "ROBOTIC",
    heroTitle3: "STARTS HERE",
    heroDesc: "Your integrated portal for Control Boards, servo motors, and precision control muscles.",
    browseCat: "Browse Product Catalog",
    catTitle: "Available Parts for Inspection & Order",
    catDesc: "Hover over the part to experience the 3D holographic effect",
    searchPlaceholder: "Search by name, description, code, or price...",
    notFoundTitle: "No matching parts found",
    notFoundDesc: "Try browsing other keywords.",
    viewDetails: "View Details",
    price: "PRICE",
    addToCart: "Add to Cart",
    cartTitle: "Digital Order Cart",
    cartInfo: "Recipient Info",
    cartName: "Recipient Name",
    cartPhone: "Active Phone Number",
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
    heroSub: "پارچەی ئەسڵی بە وردی ئەندازیاری کراوە",
    heroTitle1: "داهاتووی",
    heroTitle2: "رۆبۆتەکان",
    heroTitle3: "لێرەوە دەست پێدەکات",
    heroDesc: "دەروازەی تەواوەتیت بۆ بۆردەکانی کۆنترۆڵ و مۆتۆڕەکان.",
    browseCat: "کەتەلۆگی بەرهەمەکان",
    catTitle: "پارچە بەردەستەکان",
    catDesc: "ماوسەکە ببە سەر پارچەکە بۆ بینینی کاریگەری سێ دووری",
    searchPlaceholder: "گەڕان...",
    notFoundTitle: "هیچ پارچەیەک نەدۆزرایەوە",
    notFoundDesc: "بەشەکان بپشکنە.",
    viewDetails: "وردەکارییەکان",
    price: "نرخ",
    addToCart: "زیادکردن بۆ سەبەتە",
    cartTitle: "سەبەتەی داواکاری",
    cartInfo: "زانیاری وەرگر",
    cartName: "ناوی وەرگر",
    cartPhone: "ژمارەی تەلەفۆن",
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

export default function App() {
  const [lang, setLang] = useState('ar');
  const t = translations[lang]; 

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false); 
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false); 
  
  const [customerName, setCustomerName] = useState(''); 
  const [customerPhone, setCustomerPhone] = useState(''); 
  const [detailedAddress, setDetailedAddress] = useState(''); 
  const [selectedGovId, setSelectedGovId] = useState(''); 
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  const [user, setUser] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState(''); 
  const [visitorCount, setVisitorCount] = useState(0); 
  
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
  const [newProdChip, setNewProdChip] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdCompatLink, setNewProdCompatLink] = useState('');
  const [newProdLibLink, setNewProdLibLink] = useState('');
  const [newProdCodeSnippet, setNewProdCodeSnippet] = useState('');
  
  const [editProdId, setEditProdId] = useState(null);
  const [orders, setOrders] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalTab, setModalTab] = useState('desc'); 

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const magneticBtnRef = useRef(null);
  const magneticContainerRef = useRef(null);

  const playSynthSound = (freq, type, duration) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  const playHoverBeep = () => playSynthSound(1200, 'triangle', 0.05);
  const playSuccessBeep = () => {
    playSynthSound(600, 'sine', 0.1);
    setTimeout(() => playSynthSound(900, 'sine', 0.15), 80);
  };
  const playErrorBuzz = () => playSynthSound(150, 'sawtooth', 0.4);

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
      let address = '';
      let govId = '';
      if (userDoc.exists()) {
        phone = userDoc.data().phone || '';
        address = userDoc.data().address || '';
        govId = userDoc.data().govId || '';
      }

      const userData = {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        phone: phone,
        address: address,
        govId: govId,
        lastLogin: new Date().toISOString()
      };

      await setDoc(userDocRef, userData, { merge: true });
      localStorage.setItem("msa_store_customer", JSON.stringify(userData));
      setUser(userData);
      
      if (loggedInUser.displayName) setCustomerName(loggedInUser.displayName);
      setCustomerPhone(phone);
      setDetailedAddress(address);
      if(govId) setSelectedGovId(govId);
      
      playSuccessBeep();
      
      if(loggedInUser.uid === ADMIN_UID) {
        alert(`مرحباً بك سيادة المدير MSA STORE! تم تفعيل صلاحيات الإدارة حالياً.`);
      } else {
        alert(`مرحباً بك : ${loggedInUser.displayName} تم مزامنة بياناتك سحابياً.`);
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
      setDetailedAddress('');
      setSelectedGovId('');
      setIsAdminMode(false);
      alert("تم قطع الاتصال بالجلسة السحابية بنجاح.");
    } catch (error) {
      console.error(error);
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
  
  const fetchProjectsData = async () => {
      try {
          const q = query(collection(db, "projects"), limit(50));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const projData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setProjectsList(projData);
          }
      } catch (error) {
          console.error("خطأ في جلب المشاريع", error);
      }
  };

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
      const q = query(collection(db, "products"), limit(100));
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
    fetchProjectsData();
    fetchExternalLinks();
    
    const statsRef = doc(db, "system", "stats");
    const todayStr = new Date().toDateString(); 

    getDoc(statsRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastResetDate !== todayStr) {
          setDoc(statsRef, { visitorCount: 1, lastResetDate: todayStr }, { merge: true });
        } else {
          setDoc(statsRef, { visitorCount: increment(1) }, { merge: true }).catch(e => console.error(e));
        }
      } else {
        setDoc(statsRef, { visitorCount: 1, lastResetDate: todayStr }, { merge: true });
      }
    });

    const decreaseCount = () => {
      setDoc(statsRef, { visitorCount: increment(-1) }, { merge: true });
    };

    window.addEventListener('beforeunload', decreaseCount);
    
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const count = docSnap.data().visitorCount || 0;
        setVisitorCount(Math.max(0, count)); 
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
    };
  }, [isAdminMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem("msa_store_customer");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setCustomerName(parsed.name || '');
          setCustomerPhone(parsed.phone || '');
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

    let mouseX = 0, mouseY = 0;
    let outerX = 0, outerY = 0;
    
    let throttleTimer = null;
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
      requestAnimationFrame(updateCursor);
    };
    requestAnimationFrame(updateCursor);

    return () => {
      unsubscribe();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
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

  const handleMouseEnterInteractive = () => {
    document.body.classList.add('hover-state');
    playHoverBeep();
  };
  const handleMouseLeaveInteractive = () => {
    document.body.classList.remove('hover-state');
  };

  const handleCardMove = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  };

  const handleCardLeave = (card) => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const addToCart = (id, name, price, image, stock) => {
    const stockVal = parseInt(stock) || 0;
    if (stockVal <= 0) {
       playErrorBuzz();
       alert("عذراً، هذا المنتج نافذ من المخزن حالياً.");
       return;
    }

    playSuccessBeep();
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === id);
      if (existing) {
        return prevCart.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prevCart, { id, name, price, image, qty: 1 }];
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

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.qty) || 0), 0);
  const totalQty = cart.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0);
  
  const activeGov = deliveryLocations.find(g => g.id === selectedGovId) || { price: 0, time: '', name: '' };
  const currentDeliveryFee = Number(activeGov.price) || 0;

  const handleCheckout = async () => {
    const finalCart = cart.map(item => ({...item, qty: parseInt(item.qty) || 1})).filter(item => item.qty > 0);

    if (finalCart.length === 0) {
      alert(lang === 'ar' ? 'سلة المشتريات فارغة حالياً!' : 'Cart is empty!');
      return;
    }
    if(!customerName || !customerPhone || !selectedGovId || !detailedAddress) {
        alert(lang === 'ar' ? 'الرجاء إكمال جميع بيانات المستلم (الاسم، الهاتف، المحافظة، العنوان الدقيق)!' : 'Please fill all recipient info!');
        return;
    }
    
    playSynthSound(1500, 'sine', 0.5);
    
    const payloadData = {
      userId: user && user.uid ? String(user.uid) : "GUEST_USER",
      customerName: String(customerName || "غير محدد"),
      customerPhone: String(customerPhone || "غير محدد"),
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
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "orders"), payloadData);
      
      try {
        if (user && user.uid && user.uid !== "GUEST_USER") {
          const userDataRef = doc(db, "users", user.uid);
          await setDoc(userDataRef, { phone: customerPhone, address: detailedAddress, govId: selectedGovId }, { merge: true });
          const updatedUser = { ...user, phone: customerPhone, address: detailedAddress, govId: selectedGovId };
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
              await updateDoc(prodRef, { stock: newStock });
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
          category: newProdCategory || '', 
          chip: newProdChip || 'NEW MCU', 
          code: newProdCode || 'GENERIC', 
          desc: newProdDesc || 'منتج معدّل.', 
          img: newProdImages.length > 0 ? newProdImages[0] : (newProdImg || products.find(p => p.id === editProdId).img), 
          images: newProdImages,
          compatLink: newProdCompatLink || '',
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
          category: newProdCategory || '', 
          chip: newProdChip || 'NEW MCU', 
          code: newProdCode || 'GENERIC', 
          desc: newProdDesc || 'منتج مضاف حديثاً بواسطة لوحة تحكم الإدارة المتقدمة.', 
          img: newProdImages.length > 0 ? newProdImages[0] : (newProdImg || 'http://googleusercontent.com/image_collection/image_retrieval/10232467606554598834_0'),
          images: newProdImages,
          compatLink: newProdCompatLink || '',
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
      setNewProdCategory(''); 
      setNewProdChip(''); 
      setNewProdCode(''); 
      setNewProdImages([]);
      setNewProdCompatLink('');
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
    setNewProdCategory(prod.category || ''); 
    setNewProdChip(prod.chip || ''); 
    setNewProdCode(prod.code || ''); 
    setNewProdImages(prod.images || (prod.img ? [prod.img] : [])); 
    setNewProdCompatLink(prod.compatLink || '');
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

  const normalizedQuery = normalizeText(searchQuery);
  const filteredProducts = products.filter(prod => {
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
  });

  return (
    <div className={`tech-grid relative min-h-200 font-sans overflow-x-hidden select-none antialiased transition-colors duration-500 bg-[#0f172a] text-gray-100 flex flex-col w-full`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
      
      <div ref={cursorOuterRef} className={`custom-cursor hidden md:block fixed top-0 left-0 w-[30px] h-[30px] border rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] border-teal-500/60`}></div>
      <div ref={cursorInnerRef} className={`custom-cursor-dot hidden md:block fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] bg-teal-500`}></div>

      <header className={`border-b fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 backdrop-blur-md transition-colors duration-500 border-teal-500/20 bg-slate-900/90 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          
          <div className="flex flex-row items-center gap-3 flex-shrink-0" style={{ direction: 'ltr' }}>
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

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            <div className={`flex items-center bg-slate-900/80 border border-teal-500/30 rounded-full p-1 backdrop-blur-sm shadow-inner`}>
              <button type="button" onClick={() => setLang('ar')} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${lang === 'ar' ? 'bg-teal-500 text-slate-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>AR</button>
              <button type="button" onClick={() => setLang('en')} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${lang === 'en' ? 'bg-teal-500 text-slate-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>EN</button>
              <button type="button" onClick={() => setLang('ku')} className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${lang === 'ku' ? 'bg-teal-500 text-slate-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>KU</button>
            </div>

            {user && user.uid === ADMIN_UID && (
              <div className="flex items-center gap-2">
                 <button
                    type="button"
                    onClick={() => {
                       if(window.confirm("هل أنت متأكد من تصفير عداد الزوار الحاليين؟")) {
                          setDoc(doc(db, "system", "stats"), { visitorCount: 0 }, { merge: true });
                          playSuccessBeep();
                       }
                    }}
                    className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-yellow-500/20 border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 rounded-full font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    title="تصفير عداد الزوار (يمسح الزوار العالقين)"
                 >
                    <i className="fas fa-users-slash text-sm"></i>
                    <span className="hidden sm:inline font-mono text-xs">تصفير الزوار</span>
                 </button>

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
                <img src={user.photoURL} alt="pfp" loading="lazy" className="w-8 h-8 rounded-full border border-teal-400" />
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
          
          <button onClick={() => { setIsProjectsModalOpen(true); setIsSideMenuOpen(false); playSynthSound(600, 'sine', 0.1); }} className="w-full flex items-center gap-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 p-4 rounded-xl hover:bg-blue-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
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

          <button onClick={() => { alert('نشكر المعصوم بسبب تعليمنا للعلم'); setIsSideMenuOpen(false); playSynthSound(600, 'sine', 0.1); }} className="w-full flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl hover:bg-yellow-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
            <i className="fa-solid fa-hands-praying text-2xl"></i>
            <span className="text-sm">شكر وتقدير</span>
          </button>

          {externalLinks.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 bg-purple-500/10 border border-purple-500/30 text-purple-400 p-4 rounded-xl hover:bg-purple-500 hover:text-slate-900 transition-all font-bold shadow-md hover:scale-105">
               <i className="fa-solid fa-arrow-up-right-from-square text-2xl"></i>
               <span className="text-sm">{link.title}</span>
            </a>
          ))}
        </div>
      </div>
      
      {isSideMenuOpen && (
        <div onClick={() => setIsSideMenuOpen(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[90] transition-opacity"></div>
      )}

      {isAdminMode && user?.uid === ADMIN_UID ? (
        <Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[80vh] text-teal-500"><i className="fas fa-circle-notch fa-spin text-5xl"></i></div>}>
          <AdminPanel 
            products={products} setProducts={setProducts}
            handleSaveProduct={handleSaveProduct} handleDeleteProduct={handleDeleteProduct} handleEditClick={handleEditClick}
            newProdName={newProdName} setNewProdName={setNewProdName}
            newProdPrice={newProdPrice} setNewProdPrice={setNewProdPrice}
            newProdImg={newProdImg} setNewProdImg={setNewProdImg}
            newProdDesc={newProdDesc} setNewProdDesc={setNewProdDesc} 
            newProdImages={newProdImages} setNewProdImages={setNewProdImages} 
            newProdStock={newProdStock} setNewProdStock={setNewProdStock} 
            newProdCategory={newProdCategory} setNewProdCategory={setNewProdCategory}
            categories={categories}
            handleAddCategory={handleAddCategory}
            handleDeleteCategory={handleDeleteCategory}
            handleEditCategory={handleEditCategory}
            newProdChip={newProdChip} setNewProdChip={setNewProdChip}
            newProdCode={newProdCode} setNewProdCode={setNewProdCode}
            
            newProdCompatLink={newProdCompatLink} setNewProdCompatLink={setNewProdCompatLink}
            newProdLibLink={newProdLibLink} setNewProdLibLink={setNewProdLibLink}
            newProdCodeSnippet={newProdCodeSnippet} setNewProdCodeSnippet={setNewProdCodeSnippet}
            
            projectsList={projectsList} setProjectsList={setProjectsList}
            
            externalLinks={externalLinks} setExternalLinks={setExternalLinks}

            editProdId={editProdId}
            orders={orders} fetchOrders={fetchOrders}
            handleDeleteOrder={handleDeleteOrder} 
            visitorCount={visitorCount}
            deliveryLocations={deliveryLocations} 
            setDeliveryLocations={setDeliveryLocations} 
          />
        </Suspense>
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
              <div className={`absolute inset-y-0 ${lang === 'en' ? 'left-2 pl-4' : 'right-2 pr-4'} flex items-center pointer-events-none`}>
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

            <div className={`flex gap-2 mb-6 overflow-x-auto pb-4 px-2 custom-scrollbar hide-scroll ${searchQuery !== '' ? 'opacity-50 pointer-events-none' : ''}`}>
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

                  return (
                  <div key={prod.id} className="h-full w-full min-w-0">
                    <div 
                      onMouseEnter={handleMouseEnterInteractive} 
                      onMouseLeave={handleMouseLeaveInteractive}
                      className={`h-full w-full flex flex-col rounded-xl sm:rounded-2xl p-2 sm:p-5 relative group transition-all duration-300 border bg-slate-800/60 overflow-hidden break-words min-w-0 ${isOutOfStock ? 'border-red-500/20 hover:border-red-400/60' : 'border-teal-500/20 hover:border-teal-400/60'}`}
                    >
                      <div className="gloss-effect"></div>
                      
                      <div 
                        onClick={() => { setSelectedProduct(prod); setActiveImageIndex(0); setModalTab('desc'); playSynthSound(800, 'sine', 0.1); }}
                        className={`flex-shrink-0 h-28 sm:h-48 w-full rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-5 flex items-center justify-center border transition-all relative cursor-pointer bg-slate-900/60 ${isOutOfStock ? 'border-red-500/10 group-hover:border-red-500/30' : 'border-teal-500/10 group-hover:border-teal-500/30'}`}
                        title={t.viewDetails}
                      >
                        <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} alt={prod.name} loading="lazy" className={`object-contain h-full w-full max-h-full max-w-full transition-all duration-500 p-1 ${isOutOfStock ? 'opacity-50 grayscale' : 'group-hover:scale-110'}`} />
                        
                        {prod.images && prod.images.length > 1 && (
                           <div className={`absolute bottom-1 sm:bottom-2 ${lang === 'en' ? 'left-1 sm:left-2' : 'right-1 sm:right-2'} px-1 py-0.5 sm:px-2 sm:py-1 bg-slate-900/80 text-white rounded text-[8px] sm:text-xs font-mono shadow-md backdrop-blur-sm`}>
                              <i className="fas fa-images"></i> +{prod.images.length - 1}
                           </div>
                        )}

                        <div className={`absolute top-1 sm:top-2 ${lang === 'en' ? 'right-1 sm:right-2' : 'left-1 sm:left-2'} px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[8px] sm:text-xs font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30`}>{prod.chip || 'NEW MCU'}</div>
                        
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

                      <h3 className={`text-[11px] sm:text-lg font-bold leading-snug mb-1 sm:mb-2 line-clamp-2 flex-shrink-0 cursor-pointer text-white hover:text-teal-400 transition-colors break-words min-w-0 w-full`} onClick={() => { setSelectedProduct(prod); setActiveImageIndex(0); setModalTab('desc'); playSynthSound(800, 'sine', 0.1); }}>{prod.name}</h3>
                      
                      <p className={`text-[9px] sm:text-sm mb-3 sm:mb-5 leading-relaxed line-clamp-2 text-gray-300 flex-grow break-words min-w-0 w-full`}>{prod.desc || t.noDesc}</p>
                      
                      <div className={`mt-auto flex flex-col justify-between items-stretch sm:items-end pt-2 sm:pt-4 border-t gap-2 sm:gap-0 flex-shrink-0 w-full ${isOutOfStock ? 'border-red-500/10' : 'border-teal-500/10'} min-w-0`}>
                        <div className="w-full text-center sm:text-right min-w-0">
                           <span className="block text-[8px] sm:text-[10px] text-gray-400 font-mono font-bold truncate">{t.price}</span>
                           <span className={`text-xs sm:text-xl font-bold font-mono truncate block ${isOutOfStock ? 'text-red-400 opacity-60' : 'text-teal-400'}`}>{prod.price?.toLocaleString() || 0}</span>
                        </div>
                        <button 
                          type="button" 
                          disabled={isOutOfStock}
                          onClick={() => addToCart(prod.id, prod.name, prod.price, prod.images && prod.images.length > 0 ? prod.images[0] : prod.img, prod.stock)} 
                          className={`w-full flex items-center justify-center gap-1 p-1.5 sm:p-2 sm:px-4 rounded-full font-bold text-[9px] sm:text-xs transition-all relative z-10 shadow-md ${isOutOfStock ? 'bg-slate-700 text-gray-400 cursor-not-allowed border border-slate-600' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}
                        >
                          <i className="fas fa-cart-arrow-down"></i> <span className="truncate">{isOutOfStock ? 'نافذ' : t.addToCart}</span>
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

      {/* التذييل */}
      <footer className="w-full bg-[#0b1120] border-t border-teal-500/20 py-8 flex flex-col items-center justify-center mt-auto">
         <div className="text-center">
            <p className="text-gray-400 font-mono text-sm tracking-wider">جميع الحقوق محفوظة لدى MSA &copy; 2026</p>
         </div>
      </footer>

      {/* Cart Sidebar */}
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

        <div className="flex flex-col-reverse md:flex-row flex-grow overflow-y-auto overflow-x-hidden md:overflow-hidden custom-scrollbar">
          
          <div className={`w-full md:w-2/5 flex flex-col flex-shrink-0 h-auto md:h-full md:border-${lang === 'en' ? 'l' : 'r'} border-teal-500/10 bg-slate-800/30`}>
            <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
              <h4 className="font-bold text-teal-400 text-sm mb-4"><i className="fas fa-user-astronaut"></i> {t.cartInfo}</h4>
              <input type="text" placeholder={t.cartName} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400`} />
              <input type="tel" placeholder={t.cartPhone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-slate-900/80 border-teal-500/20 text-white focus:border-teal-400`} />
              
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
              
              <button type="button" onClick={handleCheckout} className="w-full py-4 mt-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 hover:from-teal-400 hover:to-emerald-400 font-extrabold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
                <i className="fas fa-check-double text-lg"></i> {t.cartCheckout}
              </button>
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
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg p-1 flex-shrink-0 border border-slate-100/10 flex items-center justify-center">
                      <img src={item.image} alt="" loading="lazy" className="max-w-full max-h-full object-contain" />
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-6 transition-opacity duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" 
            onClick={() => { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }}
          ></div>
          
          <div className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row transform transition-transform duration-300 scale-100 bg-[#0f172a] border border-teal-500/30`}>
            <button 
              type="button"
              onClick={() => { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }} 
              className={`absolute top-4 ${lang === 'en' ? 'left-4' : 'right-4'} z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all bg-slate-900/60 border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-slate-900`}
            >
              <i className="fas fa-times text-sm sm:text-lg"></i>
            </button>

            <div className={`w-full md:w-5/12 p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-${lang === 'en' ? 'r' : 'l'} border-teal-500/20 bg-slate-800/30 overflow-y-auto custom-scrollbar`}>
              <div className="w-full h-48 sm:h-80 bg-white rounded-2xl p-4 flex items-center justify-center shadow-sm relative overflow-hidden">
                <img 
                  src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[activeImageIndex] : selectedProduct.img} 
                  alt={selectedProduct.name} 
                  loading="lazy"
                  className={`object-contain max-h-full max-w-full ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'opacity-50 grayscale' : ''}`} 
                />
                <div className={`absolute top-4 ${lang === 'en' ? 'right-4' : 'left-4'} px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30`}>
                  {selectedProduct.chip || 'NEW MCU'}
                </div>
                
                {(parseInt(selectedProduct.stock)||0) <= 0 && (
                   <div className="absolute inset-0 bg-slate-900/60 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-2 rounded border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -rotate-12 text-sm sm:text-lg uppercase tracking-widest">
                        نافذ
                      </span>
                   </div>
                )}
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 overflow-x-auto w-full pb-2 custom-scrollbar">
                  {selectedProduct.images.map((img, idx) => {
                    if(!img || img.trim() === '') return null;
                    return (
                      <button 
                        type="button"
                        key={idx} 
                        onClick={() => { setActiveImageIndex(idx); playSynthSound(1000, 'triangle', 0.05); }}
                        className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white border-2 p-1 overflow-hidden transition-all ${activeImageIndex === idx ? 'border-teal-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt="" loading="lazy" className="object-contain w-full h-full" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-start h-full overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                <span className={`font-mono text-[10px] sm:text-[11px] tracking-widest font-bold mb-2 block text-teal-500`}>{selectedProduct.code || 'GENERIC'}</span>
                <h2 className={`text-xl sm:text-3xl font-black mb-3 sm:mb-4 text-white break-words`}>{selectedProduct.name}</h2>
                <div className="flex gap-1 text-xs sm:text-sm text-yellow-500 mb-4">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-6 border-b border-teal-500/20 mb-5 overflow-x-auto custom-scrollbar flex-shrink-0">
                  <button onClick={() => setModalTab('desc')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'desc' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                      <i className="fa-solid fa-circle-info ml-1"></i> الشرح والتفاصيل
                  </button>
                  <button onClick={() => setModalTab('code')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'code' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                      <i className="fa-solid fa-code ml-1"></i> الكود البرمجي
                  </button>
                  <button onClick={() => setModalTab('links')} className={`pb-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${modalTab === 'links' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                      <i className="fa-solid fa-link ml-1"></i> الملحقات والمكتبات
                  </button>
              </div>

              <div className="flex-grow flex flex-col mb-4 min-h-[150px]">
                  {modalTab === 'desc' && (
                      <div className={`p-4 sm:p-5 rounded-xl text-xs sm:text-sm leading-relaxed border bg-slate-800/50 border-teal-500/10 text-gray-300 h-full break-words`}>
                          {selectedProduct.desc || t.noDesc}
                      </div>
                  )}
                  
                  {modalTab === 'code' && (
                      <div className="bg-[#0a0a0f] p-4 rounded-xl border border-teal-500/20 overflow-x-auto text-left h-full shadow-inner" dir="ltr">
                          <pre className="text-teal-300 font-mono text-xs sm:text-sm">
                              {selectedProduct.codeSnippet || '// لا يوجد كود برمجي متاح لهذه القطعة حالياً.\n// يمكنك إضافة الكود من لوحة الإدارة.'}
                          </pre>
                      </div>
                  )}

                  {modalTab === 'links' && (
                      <div className="flex flex-col gap-4 h-full">
                          {selectedProduct.compatLink ? (
                              <a href={selectedProduct.compatLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm group">
                                  <span className="font-bold text-sm"><i className="fa-solid fa-microchip ml-2"></i> مادة تتوافق معه (رابط خارجي)</span>
                                  <i className="fa-solid fa-arrow-up-right-from-square group-hover:scale-110 transition-transform"></i>
                              </a>
                          ) : <div className="p-4 border border-dashed border-gray-600/50 rounded-xl text-gray-500 text-sm text-center">لا توجد مواد متوافقة مضافة.</div>}
                          
                          {selectedProduct.libLink ? (
                              <a href={selectedProduct.libLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm group">
                                  <span className="font-bold text-sm"><i className="fa-solid fa-book-bookmark ml-2"></i> تحميل مكتبة الحساس / القطعة</span>
                                  <i className="fa-solid fa-arrow-up-right-from-square group-hover:scale-110 transition-transform"></i>
                              </a>
                          ) : <div className="p-4 border border-dashed border-gray-600/50 rounded-xl text-gray-500 text-sm text-center">لا توجد مكتبة برمجية مضافة.</div>}
                      </div>
                  )}
              </div>

              <div className={`pt-4 sm:pt-6 border-t mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 border-teal-500/20 flex-shrink-0`}>
                <div className="w-full sm:w-auto text-center sm:text-right">
                  <span className="block text-[10px] sm:text-xs text-gray-400 font-mono font-bold mb-1">{t.price}</span>
                  <span className={`text-2xl sm:text-3xl font-bold font-mono ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'text-red-400 opacity-60' : 'text-teal-400'}`}>
                    {selectedProduct.price?.toLocaleString() || 0} {t.currency}
                  </span>
                </div>
                
                <button 
                  type="button"
                  disabled={(parseInt(selectedProduct.stock)||0) <= 0}
                  onClick={() => { 
                    addToCart(selectedProduct.id, selectedProduct.name, selectedProduct.price, (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0] : selectedProduct.img, selectedProduct.stock); 
                    setSelectedProduct(null); 
                  }} 
                  className={`w-full flex justify-center items-center gap-2 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed' : 'bg-teal-500 text-slate-900 hover:bg-teal-400'}`}
                >
                  <i className="fas fa-cart-arrow-down text-lg"></i> {(parseInt(selectedProduct.stock)||0) <= 0 ? 'نافذ من المخزن' : t.addToCart}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
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
                        <h3 className="text-xl font-bold text-gray-300">لا توجد مشاريع مضافة حالياً</h3>
                        <p className="text-gray-500 mt-2 text-sm">سيتم إضافة المشاريع المنجزة هنا قريباً.</p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectsList.map((proj) => (
                           <div key={proj.id} className="bg-slate-800/40 border border-teal-500/20 rounded-2xl p-5 hover:border-teal-500/50 transition-all flex flex-col h-full group">
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

    </div>
  );
}
