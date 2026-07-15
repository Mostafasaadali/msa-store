import AdminPanel from './AdminPanel'; 
import './App.css';

import {ADMIN_UID, db, auth, provider } from './firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc, updateDoc, getDoc, onSnapshot, increment } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// 🌟 قاموس اللغات
const translations = {
  ar: {
    sysOnline: "SYSTEM // ONLINE",
    adminLogin: "دخول الإدارة",
    adminLeave: "مغادرة الإدارة",
    cloudLogin: "دخول سحابي",
    cart: "سلة التسوق",
    heroSub: " //قـطـع ألكترونية مـهـنـدسـة بـدقـة عـالـيـة  ",
    heroTitle1: "مستقبلك",
    heroTitle2: "بالــروبــوت",
    heroTitle3: "يـبـدأ هـنـا",
    heroDesc: "منفذك المتكامل للحصول على بوردات التحكم ومحركات السيرفو وعضلات التحكم الدقيقة. نوفر القطع بأعلى كفاءة لمشروع التخرج أو مشروعك البرمجي القادم.",
    browseCat: "تصفح كتالوج المنتجات",
    catTitle: "القطع المتاحة للفحص والطلب",
    catDesc: "[ اضغط بالفأرة فوق الصورة للقطعة لعرضة ومعاينة تفاصيل المكونات بدقة ]",
    searchPlaceholder: "ابحث بالاسم، الوصف، بالمودل، أو حتى السعر...",
    notFoundTitle: "لم يتم العثور على قطع تطابق بحثك",
    notFoundDesc: "جرب استخدام كلمات مفتاحية أخرى أو تحقق من السعر.",
    viewDetails: "عرض التفاصيل",
    price: "PRICE",
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
    itemCount: "صنف"
  },
  en: {
    sysOnline: "SYSTEM // ONLINE",
    adminLogin: "Admin Login",
    adminLeave: "Leave Admin",
    cloudLogin: "Cloud Login",
    cart: "Cart",
    heroSub: "// PRECISION ENGINEERED ORIGINAL PARTS",
    heroTitle1: "YOUR FUTURE OF",
    heroTitle2: "ROBOTIC",
    heroTitle3: "STARTS HERE",
    heroDesc: "Your integrated portal for Control Boards, servo motors, and precision control muscles.",
    browseCat: "Browse Product Catalog",

    catTitle: "Available Parts for Inspection & Order",
    catDesc: "[ Hover over the part to experience the 3D holographic effect ]",
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
    itemCount: "Items"
  },
  ku: {
    sysOnline: "SYSTEM // ONLINE",
    adminLogin: "چوونەژوورەوەی بەڕێوەبەر",
    adminLeave: "دەرچوون",
    cloudLogin: "هەژماری هەوری",
    cart: "سەبەتە",
    heroSub: "// پارچەی ئەسڵی بە وردی ئەندازیاری کراوە",
    heroTitle1: "داهاتووی",
    heroTitle2: "رۆبۆتەکان",
    heroTitle3: "لێرەوە دەست پێدەکات",
    heroDesc: "دەروازەی تەواوەتیت بۆ بۆردەکانی کۆنترۆڵ و مۆتۆڕەکان.",
    browseCat: "کەتەلۆگی بەرهەمەکان",
    catTitle: "پارچە بەردەستەکان",
    catDesc: "[ ماوسەکە ببە سەر پارچەکە بۆ بینینی کاریگەری سێ دووری ]",
    searchPlaceholder: "گەڕان...",
    notFoundTitle: "هیچ پارچەیەک نەدۆزرایەوە",
    notFoundDesc: "بەشەکان بپشکنە.",
    viewDetails: "وردەکارییەکان",
    price: "PRICE",
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
    itemCount: "پارچە"
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

  // --- States ---
  const [gmtTime, setGmtTime] = useState('');
  const [iraqTime, setIraqTime] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sysTime, setSysTime] = useState('12:00:00');
  
  const [customerName, setCustomerName] = useState(''); 
  const [customerPhone, setCustomerPhone] = useState(''); 
  const [detailedAddress, setDetailedAddress] = useState(''); 
  const [selectedGovId, setSelectedGovId] = useState(''); 
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  const [user, setUser] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState(''); 
  const [visitorCount, setVisitorCount] = useState(0); 
  
  const isDarkMode = true; 
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [products, setProducts] = useState([]);
  
  const [categories, setCategories] = useState([]);
  const [newProdCategory, setNewProdCategory] = useState('');

  // Admin Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImg, setNewProdImg] = useState(''); 
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImages, setNewProdImages] = useState([]); 
  const [newProdStock, setNewProdStock] = useState(''); 
  const [newProdChip, setNewProdChip] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  
  const [editProdId, setEditProdId] = useState(null);
  const [orders, setOrders] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [codeEditorText, setCodeEditorText] = useState("void setup() {\n  // هيئ إعدادات الأردوينو هنا\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // اكتب كود التشغيل المستمر هنا\n  \n}");

  // --- Refs ---
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const magneticBtnRef = useRef(null);
  const magneticContainerRef = useRef(null);

  // --- Audio Synthesis Setup ---
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

  // --- Login & Auth ---
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
      // ✅ تحسين الأداء عبر جلب أحدث 50 طلب فقط بدلاً من جلب كل القاعدة
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
      console.error("Error fetching delivery locs:", e);
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
      alert("عذراً، فشل إضافة الفئة بسبب خطأ في السحابة أو نقص في الصلاحيات.");
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
      alert("فشل حذف الفئة. تأكد من صلاحياتك.");
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
      // ✅ تحسين الأداء: جلب 100 منتج بدلاً من سحب كامل المنتجات دفعة واحدة (Pagination أساسي)
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

// --- Effects ---
  useEffect(() => {
    fetchProducts(); 
    fetchCategories();
    fetchDeliveryLocations();
    
    // --- التحديث المباشر للمتواجدين حالياً (Online Users) ---
    const statsRef = doc(db, "system", "stats");

    // 1. زيادة العداد بمقدار 1 فور دخول الزائر
    setDoc(statsRef, { visitorCount: increment(1) }, { merge: true }).catch(e => console.error(e));

    // 2. دالة إنقاص العداد بمقدار 1
    const decreaseCount = () => {
      setDoc(statsRef, { visitorCount: increment(-1) }, { merge: true });
    };

    // 3. تشغيل دالة الإنقاص في اللحظة التي يغلق فيها الزائر المتصفح
    window.addEventListener('beforeunload', decreaseCount);

    // 4. المستمع الحي لتحديث الرقم على الشاشة فوراً
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const count = docSnap.data().visitorCount || 0;
        // نستخدم Math.max لمنع الرقم من النزول تحت الصفر في حالات الأخطاء
        setVisitorCount(Math.max(0, count)); 
      }
    });
    // --------------------------------------------

    if (isAdminMode) {
      fetchOrders();
    }

    // التنظيف عند إغلاق أو تحديث المكون
    return () => {
      decreaseCount(); // إنقاص الرقم
      window.removeEventListener('beforeunload', decreaseCount); // إيقاف المستمع
      unsubscribeStats(); // إيقاف الاتصال المباشر
    };
  }, [isAdminMode]);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSysTime(now.toTimeString().split(' ')[0]);
    }, 1000);

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
      clearInterval(timer);
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
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleCardLeave = (card) => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  // --- Cart Functions ---
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
      // ✅ الحفظ الآمن في السحابة فقط وإلغاء الحفظ المحلي للطلبات الوهمية
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
          images: newProdImages 
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
          images: newProdImages 
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
    <div className={`tech-grid relative min-h-200 font-sans overflow-x-hidden select-none antialiased transition-colors duration-500 bg-[#030212] text-gray-100`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div className="scanline fixed inset-0 pointer-events-none z-40"></div>
      
      <div ref={cursorOuterRef} className={`custom-cursor hidden md:block fixed top-0 left-0 w-[30px] h-[30px] border rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] border-teal-500/60`}></div>
      <div ref={cursorInnerRef} className={`custom-cursor-dot hidden md:block fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999] bg-teal-500`}></div>

      {/* Header */}
      <header className={`border-b fixed top-0 left-0 right-0 z-40 px-6 py-4 backdrop-blur-lw transition-colors duration-500 border-teal-500/20 bg-black/60`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex flex-row items-center gap-3" style={{ direction: 'ltr' }}>
            <div className="text-left flex flex-col justify-center">
              <span className={`font-mono text-xs tracking-widest block text-teal-400`}>{t.sysOnline}</span>
            </div>

<div className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all bg-teal-500/10 border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-deep-pulse">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-teal-400">
    {/* الأطراف (Pins) الطويلة والموزعة من الجهات الأربع */}
    <path d="M0 7h6v2H0z M0 11h6v2H0z M0 15h6v2H0z M18 7h6v2h-6z M18 11h6v2h-6z M18 15h6v2h-6z M7 0h2v6H7z M11 0h2v6h-2z M15 0h2v6h-2z M7 18h2v6H7z M11 18h2v6h-2z M15 18h2v6h-2z"/>
    {/* جسم الشريحة المركزي مع المربع المفرغ في المنتصف */}
    <path fillRule="evenodd" clipRule="evenodd" d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm3 5h4v4h-4z" />
  </svg>
</div>

          </div>

          <div className="flex items-center gap-4">

            <div className={`hidden sm:flex items-center gap-1 border px-2 py-1 rounded-full font-mono text-xs bg-neutral-900/80 border-teal-500/20 mx-2`}>
              <button type="button" onClick={() => setLang('ar')} className={`px-2 py-1 rounded-full transition-colors ${lang === 'ar' ? 'bg-teal-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}>عربي</button>
              <button type="button" onClick={() => setLang('ku')} className={`px-2 py-1 rounded-full transition-colors ${lang === 'ku' ? 'bg-teal-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}>کوردی</button> 
              <button type="button" onClick={() => setLang('en')} className={`px-2 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-teal-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}>EN</button>
            </div>

            {user && user.uid === ADMIN_UID && (
              <button 
                type="button"
                onMouseEnter={handleMouseEnterInteractive} onMouseLeave={handleMouseLeaveInteractive}
                onClick={() => { playSynthSound(900, 'sine', 0.1); setIsAdminMode(!isAdminMode); }}
                className="font-mono text-xs bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-user-gear"></i> {isAdminMode ? t.adminLeave : t.adminLogin}
              </button>
            )}

            {user ? (
              <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full font-mono text-xs bg-neutral-900/80 border-teal-500/20`}>
                <img src={user.photoURL} alt="pfp" className="w-5 h-5 rounded-full border border-teal-400" />
                <span className={`text-gray-200 hidden l:inline`}>{user.name}</span>
                <button type="button" onClick={handleLogout} className="text-red-500 hover:text-red-400 ml-1 transition-colors"><i className="fa-solid fa-power-off">تسجيل الخروج</i></button>
              </div>
            ) : (
              <button type="button" onClick={handleGoogleLogin} onMouseEnter={handleMouseEnterInteractive} onMouseLeave={handleMouseLeaveInteractive} className={`font-mono text-xs text-white px-4 py-2 rounded-full font-bold transition-all shadow-md bg-gradient-to-r from-teal-400 to-emerald-400 text-black`}><i className="fa-brands fa-google"></i> {t.cloudLogin}</button>
            )
            
            }

            <button type="button" onClick={() => { setIsCartOpen(true); playSynthSound(800, 'sine', 0.1); }} onMouseEnter={handleMouseEnterInteractive} onMouseLeave={handleMouseLeaveInteractive} className={`relative p-3 px-5 rounded-full border text-xs flex gap-3 group transition-all shadow-sm border-teal-500/30 bg-black/40 text-gray-300 hover:border-teal-400`}>
              <i className={`fa-solid fa-basket-shopping group-hover:scale-110 transition-transform text-teal-400`}></i>
              <span className="font-mono text-sm hidden sm:inline">{totalQty.toString().padStart(2, '0')} // {t.cart}</span>
              <span className={`absolute -top-1.5 ${lang === 'en' ? '-right-1.5' : '-left-1.5'} w-5 h-5 font-mono text-xs font-bold rounded-full flex items-center justify-center shadow-lg bg-teal-500 text-black`}>{totalQty}</span>
            </button>
          </div>
        </div>
      </header>

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
          
          newProdCategory={newProdCategory} setNewProdCategory={setNewProdCategory}
          categories={categories}
          handleAddCategory={handleAddCategory}
          handleDeleteCategory={handleDeleteCategory}
          handleEditCategory={handleEditCategory}
          
          newProdChip={newProdChip} setNewProdChip={setNewProdChip}
          newProdCode={newProdCode} setNewProdCode={setNewProdCode}
          
          editProdId={editProdId}
          orders={orders} fetchOrders={fetchOrders}
          handleDeleteOrder={handleDeleteOrder} 
          visitorCount={visitorCount}
          deliveryLocations={deliveryLocations} 
          setDeliveryLocations={setDeliveryLocations} 
        />
      ) : (
        <>

{/* --- بداية الجزء الجديد المعدل --- */}
<section className="min-h-auto flex flex-col justify-center items-center text-center px-8 pt-30 relative overflow-hidden">
  {/* قمنا بإزالة الدائرة القديمة من هنا */}
 <span className={`text-7xl font-bold tracking-tighter uppercase m-auto p-7 leading-none text-[#4ef542]`}>M <span className="text-[#ff8800]">S</span> A</span>
  <span className="font-mono text-2xl tracking-[0.04em] mb-3 text-teal-400 animate-deep-pulse">{t.heroSub}</span>
  
<h1 className="text-6xl md:text-8xl font-cairo-black uppercase leading-tight relative z-10 flex items-center justify-center flex-wrap">
  <span className="scanline-text">{t.heroTitle1}</span> 
  
  <span className="robot-gradient-scanline mx-4 robot-glow-container">
      {t.heroTitle2}
  </span> 
  
  <span className="scanline-text">{t.heroTitle3}</span>
</h1>
  <p className="max-w-xl m-auto p-6 text-sm md:text-lg mb-2 font-light text-gray-400">
    {t.heroDesc}
  </p>
            <div ref={magneticContainerRef} className="p-10 cursor-pointer">
              <button type="button" ref={magneticBtnRef} onClick={() => document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' })} className={`relative px-10 py-5 bg-transparent border rounded-full text-sm uppercase tracking-widest overflow-hidden group transition-all duration-300 shadow-sm border-teal-500/30 text-teal-400 hover:border-teal-400`}>
                <span className="relative z-10 font-bold flex items-center gap-3 group-hover:text-black transition-colors duration-1000">
                  <i className="fa-solid fa-arrow-down-long animate-bounce"></i> {t.browseCat}
                </span>
                <div className="absolute inset-0 bg-teal-400 scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 ease-out z-0"></div>
              </button>
            </div>
          </section>

          <section className={`max-w-7xl mx-auto px-1 py-2 border-t border-teal-500/10`} id="productsSection">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
 
                <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-white`}>{t.catTitle}</h2>
              </div>
              <p className={`max-w-sm text-sm font-mono text-gray-500`}>{t.catDesc}</p>
            </div>

            <div className="mb-8 relative w-full md:w-1/2 lg:w-1/3">
              <div className={`absolute inset-y-0 ${lang === 'en' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                <i className="fa-solid fa-magnifying-glass text-teal-400"></i>
              </div>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onMouseEnter={handleMouseEnterInteractive} 
                onMouseLeave={handleMouseLeaveInteractive}
                className={`w-full p-4 ${lang === 'en' ? 'pl-12' : 'pr-12'} rounded-2xl text-sm outline-none transition-all border shadow-sm bg-black/40 border-teal-500/20 text-white focus:border-teal-400 focus:bg-black/60 placeholder-gray-500`}
              />
            </div>

            <div className={`flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar hide-scroll ${searchQuery !== '' ? 'opacity-50 pointer-events-none' : ''}`}>
               <button 
                  onClick={() => setSelectedCatFilter('')} 
                  className={`px-5 py-2.5 rounded-full font-mono text-xs border whitespace-nowrap transition-all shadow-sm ${selectedCatFilter === '' ? 'bg-teal-500 text-black font-bold border-teal-500' : 'bg-black/40 text-gray-400 border-teal-500/20 hover:border-teal-400'}`}
               >
                  All / الكل
               </button>
               {categories.map(c => (
                   <button 
                      key={c.id} 
                      onClick={() => setSelectedCatFilter(c.name)} 
                      className={`px-5 py-2.5 rounded-full font-mono text-xs border whitespace-nowrap transition-all shadow-sm ${selectedCatFilter === c.name ? 'bg-teal-500 text-black font-bold border-teal-500' : 'bg-black/40 text-gray-400 border-teal-500/20 hover:border-teal-400'}`}
                   >
                      {c.name}
                   </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredProducts.length === 0 ? (
                <div className="col-span-1 md:col-span-3 text-center py-16 border rounded-2xl border-dashed border-teal-500/20 bg-neutral-900/20">
                  <i className="fa-solid fa-microchip text-5xl text-teal-500/30 mb-4 animate-pulse"></i>
                  <h3 className="text-xl font-bold text-gray-300">{t.notFoundTitle}</h3>
                  <p className="text-sm text-gray-500 mt-2">{t.notFoundDesc}</p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const stockCount = parseInt(prod.stock) || 0;
                  const isOutOfStock = stockCount <= 0;

                  return (
                  <div key={prod.id} style={{ perspective: '1000px' }}>
                    <div 
                      onMouseMove={(e) => handleCardMove(e, e.currentTarget)} 
                      onMouseLeave={(e) => { handleCardLeave(e.currentTarget); handleMouseLeaveInteractive(); }} 
                      onMouseEnter={handleMouseEnterInteractive} 
                      className={`rounded-2xl p-6 relative group transform-style-preserve-3d transition-all duration-300 border bg-neutral-900/40 ${isOutOfStock ? 'border-red-500/20 hover:border-red-400/60' : 'border-teal-500/20 hover:border-teal-400/60'}`}
                    >
                      <div className="gloss-effect"></div>
                      <div 
                        onClick={() => { setSelectedProduct(prod); setActiveImageIndex(0); playSynthSound(800, 'sine', 0.1); }}
                        className={`h-64 rounded-xl overflow-hidden mb-6 flex items-center justify-center border transition-all relative cursor-pointer bg-black/40 ${isOutOfStock ? 'border-red-500/10 group-hover:border-red-500/30' : 'border-teal-500/10 group-hover:border-teal-500/30'}`}
                        title={t.viewDetails}
                      >
                        <img src={prod.images && prod.images.length > 0 ? prod.images[0] : prod.img} alt={prod.name} className={`object-contain h-48 w-full transition-all duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : 'group-hover:scale-110 group-hover:rotate-6'}`} />
                        
                        {prod.images && prod.images.length > 1 && (
                           <div className={`absolute bottom-3 ${lang === 'en' ? 'left-3' : 'right-3'} px-2 py-1 bg-black/80 text-white rounded text-xs font-mono shadow-md backdrop-blur-sm`}>
                              <i className="fa-solid fa-images"></i> +{prod.images.length - 1}
                           </div>
                        )}

                        <div className={`absolute top-3 ${lang === 'en' ? 'right-3' : 'left-3'} px-2 py-1 rounded text-xs font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30`}>{prod.chip || 'NEW MCU'}</div>
                        
                        {isOutOfStock && (
                           <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                              <span className="bg-red-600 text-white font-bold px-6 py-2 rounded border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -rotate-12 text-lg uppercase tracking-widest">
                                نافذ من المخزن
                              </span>
                           </div>
                        )}

                        <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-black/70 text-white font-bold text-xs px-4 py-2 rounded-full tracking-widest"><i className="fa-solid fa-eye"></i> {t.viewDetails}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-mono text-[10px] tracking-widest font-bold text-teal-500`}>// {prod.code || 'GENERIC'}</span>
                        
                        {prod.category && (
                          <span className={`font-mono text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20 mr-2`}>{prod.category}</span>
                        )}

                      </div>
                      <h3 className={`text-xl font-bold mb-2 group-hover:text-teal-500 transition-colors cursor-pointer text-white`} onClick={() => { setSelectedProduct(prod); setActiveImageIndex(0); playSynthSound(800, 'sine', 0.1); }}>{prod.name}</h3>
                      <p className={`text-sm mb-6 leading-relaxed line-clamp-2 text-gray-400`}>{prod.desc || t.noDesc}</p>
                      <div className={`flex justify-between items-center pt-4 border-t ${isOutOfStock ? 'border-red-500/10' : 'border-teal-500/10'}`}>
                        <div><span className="block text-[10px] text-gray-500 font-mono font-bold">{t.price}</span><span className={`text-2xl font-bold font-mono ${isOutOfStock ? 'text-red-400 opacity-60' : 'text-teal-400'}`}>{prod.price?.toLocaleString() || 0} {t.currency}</span></div>
                        <button 
                          type="button" 
                          disabled={isOutOfStock}
                          onClick={() => addToCart(prod.id, prod.name, prod.price, prod.images && prod.images.length > 0 ? prod.images[0] : prod.img, prod.stock)} 
                          className={`p-3 px-5 rounded-full font-bold text-xs transition-all relative z-10 shadow-md ${isOutOfStock ? 'bg-neutral-800 text-gray-500 cursor-not-allowed border border-neutral-700' : 'bg-teal-500 text-black hover:bg-teal-400'}`}
                        >
                          {isOutOfStock ? 'نافذ' : t.addToCart}
                        </button>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </section>
        </>
      )}

      {!isAdminMode && (
         <button 
            type="button"
            onClick={() => { setIsCodeEditorOpen(true); playSynthSound(900, 'sine', 0.1); }}
            className={`fixed bottom-8 ${lang === 'en' ? 'right-8' : 'left-8'} w-14 h-14 bg-gradient-to-br from-teal-400 to-blue-500 text-black rounded-full flex items-center justify-center text-xl shadow-[0_0_25px_rgba(20,184,166,0.5)] z-40 hover:scale-110 hover:rotate-12 transition-all duration-300`}
            title="فتح محرر الأكواد"
         >
            <i className="fa-solid fa-code"></i>
         </button>
      )}

      {isCodeEditorOpen && (
         <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCodeEditorOpen(false)}></div>
            <div className="relative w-full max-w-5xl h-[85vh] flex flex-col bg-[#1e1e1e] border border-neutral-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
               
               <div className="bg-[#2d2d2d] flex flex-col border-b border-neutral-800 p-3 gap-3">
                  <div className="flex justify-between items-center w-full">
                      <div className="flex gap-2 w-20">
                         <div className="w-3.5 h-3.5 rounded-full bg-red-500 cursor-pointer" onClick={() => setIsCodeEditorOpen(false)}></div>
                         <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
                         <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono tracking-widest flex items-center gap-2">
                         <i className="fa-solid fa-microchip text-teal-400"></i> AI_WORKSPACE.ino
                      </div>
                      <div className="w-20 text-right">
                         <button type="button" onClick={() => setIsCodeEditorOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <i className="fa-solid fa-xmark text-lg"></i>
                         </button>
                      </div>
                  </div>
                  
                  {/* شريط الإدخال الجديد للذكاء الاصطناعي */}
                  <div className="flex items-center gap-2 w-full">
                      <input 
                          type="text" 
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          placeholder="أدخل فكرة مشروعك ليقوم Gemini بتحليلها وكتابة الكود (مثال: سيرفو يفتح باب بالمسافة)..."
                          className="flex-grow bg-[#1e1e1e] text-white text-sm font-sans px-4 py-2.5 rounded-lg outline-none border border-neutral-700 focus:border-teal-500 transition-colors"
                          disabled={isAILoading}
                      />
                      <button 
                          onClick={handleAIGenerate}
                          disabled={isAILoading}
                          className="bg-gradient-to-r from-teal-500 to-blue-600 text-black font-bold px-5 py-2.5 rounded-lg text-sm transition-all hover:scale-105 disabled:opacity-50 whitespace-nowrap shadow-lg flex items-center gap-2"
                      >
                          <i className={`fa-solid ${isAILoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i> 
                          <span className="hidden sm:inline">{isAILoading ? 'جاري التحليل...' : 'توليد الكود'}</span>
                      </button>
                  </div>
               </div>

               <div className="flex flex-grow overflow-hidden relative">
                  <div className="bg-[#1e1e1e] text-[#858585] font-mono text-sm py-4 px-4 text-right border-l border-neutral-800 select-none hidden sm:block min-w-[50px]">
                     {codeEditorText.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                  </div>
                  <textarea
                     className="flex-grow w-full bg-[#1e1e1e] text-[#9cdcfe] font-mono text-sm sm:text-base p-4 focus:outline-none resize-none custom-scrollbar leading-relaxed"
                     spellCheck="false"
                     dir="ltr"
                     value={codeEditorText}
                     onChange={(e) => setCodeEditorText(e.target.value)}
                  ></textarea>
               </div>

               <div className="bg-[#007acc] text-white text-xs px-4 py-2 flex justify-between items-center">
                  <span><i className="fa-solid fa-code-branch"></i> main*</span>
                  <button 
                     type="button" 
                     onClick={() => {
                        navigator.clipboard.writeText(codeEditorText);
                        alert("تم نسخ الكود بنجاح!");
                     }}
                     className="hover:bg-blue-600 px-4 py-1.5 rounded flex items-center gap-2 font-bold transition-colors border border-blue-400"
                  >
                     نسخ الكود <i className="fa-regular fa-copy"></i>
                  </button>
               </div>
            </div>
         </div>
      )}

      <div className={`fixed inset-y-0 ${lang === 'en' ? 'right-0' : 'left-0'} w-full md:w-[850px] border-${lang === 'en' ? 'l' : 'r'} shadow-2xl z-50 transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : (lang === 'en' ? 'translate-x-full' : '-translate-x-full')} bg-[#0c0c11] border-teal-500/20`}>
        
        <div className={`p-5 border-b flex justify-between items-center bg-black/40 border-teal-500/20`}>
          <div className="flex items-center gap-5">
            <i className={`fa-solid fa-barcode text-xl text-teal-400`}></i>
            <div><h3 className={`text-lg font-bold text-white`}>{t.cartTitle}</h3></div>
          </div>
          <button type="button" onClick={() => { setIsCartOpen(false); playSynthSound(400, 'sine', 0.1); }} className={`w-8 h-0 rounded-full border flex items-center justify-center transition-colors border-teal-500/20 hover:bg-neutral-800`}>
            <i className={`fa-solid fa-xmark text-teal-400`}></i>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          
          <div className={`w-full md:w-2/5 flex flex-col border-${lang === 'en' ? 'l' : 'r'} border-teal-500/10 bg-black/20`}>
            <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
              <h4 className="font-bold text-teal-500 text-sm mb-4"><i className="fa-solid fa-user-astronaut"></i> {t.cartInfo}</h4>
              <input type="text" placeholder={t.cartName} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-black/80 border-teal-500/20 text-white focus:border-teal-400`} />
              <input type="tel" placeholder={t.cartPhone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={`w-full p-1 border rounded-xl text-sm outline-none transition-all bg-black/80 border-teal-500/20 text-white focus:border-teal-400`} />
              
              <select 
                 value={selectedGovId} 
                 onChange={e => setSelectedGovId(e.target.value)} 
                 className={`w-full p-3 border rounded-l text-sm outline-none transition-all bg-black/80 border-teal-500/20 text-white focus:border-teal-400`}
              >
                 <option value="" disabled>اختر المحافظة</option>
                 {deliveryLocations.map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name} ({Number(gov.price).toLocaleString()} د.ع)</option>
                 ))}
              </select>

              <textarea placeholder={t.cartAddress} value={detailedAddress} onChange={(e) => setDetailedAddress(e.target.value)} className={`w-full p-3 border rounded-xl text-sm outline-none transition-all bg-black/80 border-teal-500/20 text-white focus:border-teal-400 min-h-[80px] resize-none`}></textarea>
            </div>

            <div className={`p-3 border-t space-y-4 bg-black/10 border-teal-500/20`}>
              <div className={`flex justify-between font-mono text-sm font-bold text-gray-400`}><span>{t.cartSub}</span><span>{subtotal.toLocaleString()} {t.currency}</span></div>
              
              <div className={`flex justify-between font-mono text-sm font-bold text-gray-400`}>
                 <span>{t.cartDelivery}</span>
                 <span>{currentDeliveryFee.toLocaleString()} {t.currency}</span>
              </div>
              
              {selectedGovId && (
                 <div className={`flex justify-between font-mono text-xs text-teal-200`}>
                    <span>{t.cartTime}</span>
                    <span>{activeGov.time}</span>
                 </div>
              )}

              <div className={`flex justify-between text-xl font-bold pt-1 border-t text-white border-teal-500/10`}>
                 <span>{t.cartTotal}</span>
                 <span className={`font-mono text-teal-400`}>{(subtotal + currentDeliveryFee).toLocaleString()} {t.currency}</span>
              </div>
              
              <button type="button" onClick={handleCheckout} className="w-full py-4 mt-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:from-teal-400 hover:to-emerald-400 font-extrabold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
                <i className="fa-solid fa-check-double text-lg"></i> {t.cartCheckout}
              </button>
            </div>
          </div>

          <div className="w-full md:w-3/5 flex flex-col bg-transparent">
            
            <div className="p-4 border-b border-teal-500/10 flex justify-between items-center bg-black/10">
              <span className="font-bold text-teal-400 text-sm"><i className="fa-solid fa-microchip"></i> {t.cartItems}</span>
              <span className="font-mono text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded border border-teal-500/30">{cart.length} {t.itemCount}</span>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className={`h-full flex flex-col justify-center items-center text-center font-mono text-gray-500`}>
                  <i className="fa-solid fa-ghost text-4xl mb-4 text-teal-500/20 animate-bounce"></i>
                  <p>{t.cartEmpty}</p>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={item.id || i} className={`border rounded-xl p-4 flex gap-4 items-center shadow-sm hover:border-teal-500/40 transition-colors bg-black/40 border-teal-500/10`}>
                    <div className="w-16 h-16 bg-white rounded-lg p-1 flex-shrink-0 border border-slate-100/10 flex items-center justify-center">
                      <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <h4 className={`font-bold text-sm line-clamp-1 text-white`}>{item.name}</h4>
                      <span className={`font-mono text-xs font-bold mt-1 block text-teal-400`}>{Number(item.price).toLocaleString()} {t.currency}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      
                      <div className={`flex items-center gap-1 border rounded-lg px-1 py-1 bg-black/60 border-teal-500/30`}>
                        <button type="button" onClick={() => updateQty(item.id, 1)} className={`w-7 h-7 rounded text-xs font-bold transition-colors text-teal-400 hover:bg-teal-500/20`}>+</button>
                        
                        <input 
                          type="number" 
                          min="0"
                          value={item.qty}
                          onChange={(e) => setItemQty(item.id, e.target.value)}
                          className={`w-10 text-center font-mono text-sm font-bold outline-none bg-transparent text-white`}
                          style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                        />
                        
                        <button type="button" onClick={() => updateQty(item.id, -1)} className={`w-7 h-7 rounded text-xs font-bold transition-colors text-red-400 hover:bg-red-500/20`}>-</button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {isCartOpen && <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"></div>}

      {selectedProduct && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }}
          ></div>
          
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row transform transition-transform duration-300 scale-100 bg-[#0c0c11] border border-teal-500/30`}>
            
            <button 
              type="button"
              onClick={() => { setSelectedProduct(null); playSynthSound(400, 'sine', 0.1); }} 
              className={`absolute top-4 ${lang === 'en' ? 'left-4' : 'right-4'} z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all bg-black/50 border-teal-500/30 text-teal-400 hover:bg-teal-500 hover:text-black`}
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className={`w-full md:w-1/2 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-${lang === 'en' ? 'r' : 'l'} border-teal-500/20 bg-black/40`}>
              <div className="w-full h-64 md:h-80 bg-white rounded-2xl p-4 flex items-center justify-center shadow-sm relative overflow-hidden">
                <img 
                  src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[activeImageIndex] : selectedProduct.img} 
                  alt={selectedProduct.name} 
                  className={`object-contain max-h-full max-w-full ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'opacity-50 grayscale' : ''}`} 
                />
                <div className={`absolute top-4 ${lang === 'en' ? 'right-4' : 'left-4'} px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30`}>
                  {selectedProduct.chip || 'NEW MCU'}
                </div>
                
                {(parseInt(selectedProduct.stock)||0) <= 0 && (
                   <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-600 text-white font-bold px-6 py-2 rounded border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -rotate-12 text-lg uppercase tracking-widest">
                        نافذ من المخزن
                      </span>
                   </div>
                )}
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto w-full pb-2 custom-scrollbar">
                  {selectedProduct.images.map((img, idx) => {
                    if(!img || img.trim() === '') return null;
                    return (
                      <button 
                        type="button"
                        key={idx} 
                        onClick={() => { setActiveImageIndex(idx); playSynthSound(1000, 'triangle', 0.05); }}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl bg-white border-2 p-1 overflow-hidden transition-all ${activeImageIndex === idx ? 'border-teal-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt="" className="object-contain w-full h-full" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
              <div className="mb-6">
                <span className={`font-mono text-[11px] tracking-widest font-bold mb-2 block text-teal-500`}>// {selectedProduct.code || 'GENERIC'}</span>
                <h2 className={`text-2xl md:text-3xl font-black mb-4 text-white`}>{selectedProduct.name}</h2>
                <div className="flex gap-1 text-sm text-yellow-500 mb-6">
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                
                <div className={`p-4 rounded-xl text-sm leading-relaxed mb-8 border bg-neutral-900/50 border-teal-500/10 text-gray-300`}>
                  {selectedProduct.desc || t.noDesc}
                </div>
              </div>

              <div className={`pt-6 border-t mt-auto flex flex-col sm:flex-row justify-between items-center gap-6 border-teal-500/20`}>
                <div>
                  <span className="block text-xs text-gray-500 font-mono font-bold mb-1">{t.price}</span>
                  <span className={`text-3xl font-bold font-mono ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'text-red-400 opacity-60' : 'text-teal-400'}`}>
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
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${(parseInt(selectedProduct.stock)||0) <= 0 ? 'bg-neutral-800 text-gray-500 border border-neutral-700 cursor-not-allowed' : 'bg-teal-500 text-black hover:bg-teal-400'}`}
                >
                  <i className="fa-solid fa-cart-plus"></i> {(parseInt(selectedProduct.stock)||0) <= 0 ? 'نافذ من المخزن' : t.addToCart}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}