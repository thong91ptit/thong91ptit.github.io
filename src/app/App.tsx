import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { Textarea } from "./components/ui/textarea";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { query, where, onSnapshot } from "firebase/firestore";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import {
  OrderForm,
  Order,
  UserSys,
} from "./components/OrderForm";
import { OrderAvailableForm } from "./components/OrderAvailableForm";

import { OrderList } from "./components/OrderList";
import { OrderStats } from "./components/OrderStats";
import { LoginScreen } from "./components/LoginScreen";
import { OrderDetailsDialog } from "./components/OrderDetailsDialog";
import { OrderAvailableDetail } from "./components/OrderAvailableDetail";
import { LoadingScreen } from "./components/LoadingScreen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Loader,
  Cake,
  LogOut,
  Eye,
  Pencil,
  Trash2,
  CircleCheck,
  X,
  Upload,
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const STORAGE_KEY = "cake-orders";
const STORAGE_KEY_AVAILABLE = "cake-orders-available";
const AUTH_STORAGE_KEY = "cake-orders-auth";

// Firebase will be initialized inside the component
let db: any = null;

export default function App() {
  const [isProcessingImages, setIsProcessingImages] =
    useState(false);
  const [isPaidFull, setIsPaidFull] =
    useState<Order["paymentFull"]>(false);
  const [paymentImages, setPaymentImages] = useState<File[]>(
    [],
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [userPermission, setUserPermission] =
    useState<string>("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    name: string;
    pass: string;
    changed: boolean;
  } | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] =
    useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersAvailable, setOrdersAvailable] = useState<
    Order[]
  >([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(
    [],
  );
  const [userSales, setUserSales] = useState<UserSys[]>([]);
  const [userSanxuat, setUserSanxuat] = useState<UserSys[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<string>("all");
  const [
    statusCakeAvailableFilter,
    setStatusCakeAvailableFilter,
  ] = useState<string[]>(["completed"]);

  const [statusCakeOrderFilter, setStatusCakeOrderFilter] =
    useState<string[]>(["pending", "in-progress", "completed"]);

  const [dateFilterType, setDateFilterType] = useState<
    "orderDate" | "deliveryDate"
  >("deliveryDate");
  const [sourceFilterType, setSourceFilterType] = useState<
    "all" | "in-shop-vanphu" | "in-shop-vankhe"
  >("all");
  const [filterTho, setFilterTho] = useState<string>("all");
  // Set default date range to today (show only today's deliveries)
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const sub4today = new Date(
    new Date().setDate(new Date().getDate() - 3),
  ).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string | null;
  }>({ from: today, to: today });

  const [dateRangeCakeAvailable, setDateRangeCakeAvailable] =
    useState<{
      from: string;
      to: string | null;
    }>({ from: sub4today, to: today });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormAvailableOpen, setFormAvailableOpen] =
    useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [
    isOrderAvailableDetailOpen,
    setIsOrderAvailableDetailOpen,
  ] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] =
    useState<Order | null>(null);
  const [orderToChangeStatus, setOrderToChangeStatus] =
    useState<Order | null>(null);
  const [newStatus, setNewStatus] =
    useState<Order["status"]>("pending");
  const [orderToChangeNguoiLam, setOrderToChangeNguoiLam] =
    useState<Order | null>(null);
  const [newNguoiLam, setNewNguoiLam] = useState("");

  const [orderToChangeNguoiGiao, setOrderToChangeNguoiGiao] =
    useState<Order | null>(null);
  const [newNguoiGiao, setNewNguoiGiao] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] =
    useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChangedPass, setLoadingChangedPass] =
    useState(false);
  const [openChangePassword, setOpenChangePassword] =
    useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [shipDisplay, setShipDisplay] = useState("");
  const [orderType, setOrderType] = useState("cake-order");
  const [previewImage, setPreviewImage] = useState<
    string | null
  >(null);
  const STATUS_LIST_CAKE_AVAILABLE = [
    { label: "Chưa có sẵn", value: "pending" },
    { label: "Có sẵn", value: "completed" },
    { label: "Đã Bán", value: "delivered" },
    { label: "Đã Hủy", value: "cancelled" },
  ];
  const STATUS_LIST_CAKE_ORDER = [
    { label: "Chờ xử lí", value: "pending" },
    { label: "Đang xử lí", value: "in-progress" },
    { label: "Đã hoàn thành", value: "completed" },
    { label: "Đã giao hàng", value: "delivered" },
    { label: "Đã Hủy", value: "cancelled" },
  ];
  const pendingAlertRef = useRef<{
    type: "toast" | "dialog";
    message: string;
  } | null>(null);
  // Initialize Firebase
  useEffect(() => {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyCmW-wFAbrQv8LPLii0Xk1QzNoTEGzWJVU",
        authDomain: "tiemlomo-9dca4.firebaseapp.com",
        projectId: "tiemlomo-9dca4",
        storageBucket: "tiemlomo-9dca4.firebasestorage.app",
        messagingSenderId: "824783738722",
        appId: "1:824783738722:web:8b8ff686b056c25f09be3b",
        measurementId: "G-9QYFB9HMB1",
      };
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        const app = initializeApp(firebaseConfig);

        db = getFirestore(app);
        console.log("✅ Firebase initialized successfully");
      } else {
        console.log(
          "ℹ️ Firebase not configured - using local storage mode (admin/admin to login)",
        );
      }
    } catch (error) {
      console.error("❌ Error initializing Firebase:", error);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (authData) {
      try {
        const {
          isLoggedIn,
          timestamp,
          permission,
          userId,
          username,
          name,
          pass,
          changed,
        } = JSON.parse(authData);
        // Check if session is still valid (24 hours)
        const sessionDuration = Date.now() - timestamp;
        if (
          isLoggedIn &&
          sessionDuration < 24 * 60 * 60 * 1000
        ) {
          setIsAuthenticated(true);
          setUserPermission(permission);
          setCurrentUser({
            id: userId,
            username: username,
            name: name,
            pass: pass,
            changed: changed,
          });
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to parse auth data:", error);
      }
    }
  }, []);

  // listener order
  useEffect(() => {
    if (!isAuthenticated) return;

    const ordersRef = collection(db, "orders");

    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();

        const order: Order = {
          id: change.doc.id, // ✅ FIX
          customerName: data.customerName || "",
          customerPhone: data.customerPhone || "",
          customerEmail: data.customerEmail || "",
          orderDate: data.orderDate || "",
          deliveryDate: data.deliveryDate || "",
          deliveryTime: data.deliveryTime || "",
          status: data.status || "pending",
          notes: data.notes || "",
          price: data.price || 0,
          deposit: data.deposit || 0,
          cakeType: data.cakeType || "banh-sinh-nhat",
          cakeSize: data.cakeSize || "",
          creamType: data.creamType || "kem-thuong",
          deliveryAddress: data.deliveryAddress || "",
          orderSource: data.orderSource || "page",
          photos: data.photos || [],
          paymentFull: data.paymentFull || false,
          createdBy: data.createdBy || "",
          nguoiLam: data.nguoiLam || "",
          nguoiGiao: data.nguoiGiao || "",
          ship: data.ship || 0,
          phukien: data.phukien || "",
          noidung: data.noidung || "",
          giaohangNotes: data.giaohangNotes || "",
          orderType: data.orderType || "cake-order",
          userLastUpdated: data.userLastUpdated || "",
        };

        const checkOrderExist = getOrderById(change.doc.id);
        if (checkOrderExist && change.type === "added") {
          return;
        }
        const currentDateFormatted =
          new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
          });

        if (change.type === "added" && !checkOrderExist) {
          pendingAlertRef.current = {
            type: "toast",
            message:
              order.deliveryDate ===
              new Date().toLocaleDateString("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
              })
                ? `[HÔM NAY] Có đơn mới • ${order.id.slice(0, 8)}`
                : `Có đơn mới • ${order.id.slice(0, 8)}`,
          };
        }

        if (
          checkOrderExist != null &&
          userPermission === "sanxuat" &&
          change.type === "modified"
        ) {
          if (
            checkOrderExist.notes !== order.notes ||
            checkOrderExist.deliveryDate !==
              order.deliveryDate ||
            checkOrderExist.deliveryTime !==
              order.deliveryTime ||
            checkOrderExist.nguoiLam === currentUser.username ||
            checkOrderExist.cakeSize !== order.cakeSize ||
            checkOrderExist.cakeType !== order.cakeType ||
            checkOrderExist.creamType !== order.creamType
          ) {
            if (
              checkOrderExist.status === "in-progress" ||
              checkOrderExist.status === "completed"
            ) {
              if (isDataLoaded) {
                pendingAlertRef.current = {
                  type: "dialog",
                  message: `Đơn ${order.id.slice(0, 8)} có thay đổi, vui lòng kiểm tra`,
                };
              }
            } else {
              if (isDataLoaded) {
                pendingAlertRef.current = {
                  type: "toast",
                  message: `Đơn ${order.id.slice(0, 8)} có thay đổi, làm ơn kiểm tra`,
                };
              }
            }
          } else {
            const isSame =
              checkOrderExist.photos.length ===
                order.photos.length &&
              checkOrderExist.photos.every(
                (p, i) => p === order.photos[i],
              );
            if (!isSame) {
              if (
                checkOrderExist.status === "in-progress" ||
                checkOrderExist.status == "completed"
              ) {
                if (isDataLoaded) {
                  pendingAlertRef.current = {
                    type: "dialog",
                    message: `Đơn ${order.id.slice(0, 8)} có thay đổi, vui lòng kiểm tra`,
                  };
                }
              } else {
                if (isDataLoaded) {
                  pendingAlertRef.current = {
                    type: "toast",
                    message: `Đơn ${order.id.slice(0, 8)} có thay đổi, làm ơn kiểm tra`,
                  };
                }
              }
            }
          }
        }

        if (order.orderType == "cake-order") {
          setOrders((prev) => {
            if (change.type === "added") {
              // avoid duplicate
              if (prev.some((o) => o.id === order.id))
                return prev;
              return [...prev, order];
            }

            if (change.type === "modified") {
              return prev.map((o) =>
                o.id === order.id ? order : o,
              );
            }

            if (change.type === "removed") {
              return prev.filter((o) => o.id !== order.id);
            }

            return prev;
          });
        }
        if (order.orderType == "cake-available") {
          setOrdersAvailable((prev) => {
            if (change.type === "added") {
              // avoid duplicate
              if (prev.some((o) => o.id === order.id))
                return prev;
              return [...prev, order];
            }

            if (change.type === "modified") {
              return prev.map((o) =>
                o.id === order.id ? order : o,
              );
            }

            if (change.type === "removed") {
              return prev.filter((o) => o.id !== order.id);
            }

            return prev;
          });
        }
      });
    });

    return () => unsubscribe();
  }, [isAuthenticated, isDataLoaded]);

  // Load orders from localStorage on mount (backup/fallback)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedAvailable = localStorage.getItem(
      STORAGE_KEY_AVAILABLE,
    );
    if (stored) {
      try {
        const parsedOrders = JSON.parse(stored);
        // Migrate old orders to include new fields
        const migratedOrders = parsedOrders.map(
          (order: any) => ({
            ...order,
            customerEmail: order.customerEmail || "",
            orderSource: order.orderSource || "page",
            deliveryAddress: order.deliveryAddress || "",
            price: order.price !== undefined ? order.price : 0,
            deliveryDate: order.deliveryDate || "",
            deliveryTime: order.deliveryTime || "",
            cakeType: order.cakeType || "banh-sinh-nhat",
            cakeSize: order.cakeSize || "",
            creamType: order.creamType || "kem-thuong",
            deposit:
              order.deposit !== undefined ? order.deposit : 0,
            createdBy: order.createdBy || "",
            nguoiLam: order.nguoiLam || "",
            paymentFull: order.paymentFull || false,
            nguoiGiao: order.nguoiGiao || "",
            ship: order.ship || 0,
            phukien: order.phukien || "",
            noidung: order.noidung || "",
            giaohangNotes: order.giaohangNotes || "",
            orderType: order.orderType || "cake-order",
            userLastUpdated: order.userLastUpdated || "",
          }),
        );
        setOrders(migratedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    }
    if (storedAvailable) {
      try {
        const parsedOrders = JSON.parse(storedAvailable);
        // Migrate old orders to include new fields
        const migratedOrders = parsedOrders.map(
          (order: any) => ({
            ...order,
            customerEmail: order.customerEmail || "",
            orderSource: order.orderSource || "page",
            deliveryAddress: order.deliveryAddress || "",
            price: order.price !== undefined ? order.price : 0,
            deliveryDate: order.deliveryDate || "",
            deliveryTime: order.deliveryTime || "",
            cakeType: order.cakeType || "banh-sinh-nhat",
            cakeSize: order.cakeSize || "",
            creamType: order.creamType || "kem-thuong",
            deposit:
              order.deposit !== undefined ? order.deposit : 0,
            createdBy: order.createdBy || "",
            nguoiLam: order.nguoiLam || "",
            paymentFull: order.paymentFull || false,
            nguoiGiao: order.nguoiGiao || "",
            ship: order.ship || 0,
            phukien: order.phukien || "",
            noidung: order.noidung || "",
            giaohangNotes: order.giaohangNotes || "",
            orderType: order.orderType || "cake-order",
            userLastUpdated: order.userLastUpdated || "",
          }),
        );
        setOrdersAvailable(migratedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (
      orders.length > 0 ||
      localStorage.getItem(STORAGE_KEY)
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (
      ordersAvailable.length > 0 ||
      localStorage.getItem(STORAGE_KEY_AVAILABLE)
    ) {
      localStorage.setItem(
        STORAGE_KEY_AVAILABLE,
        JSON.stringify(ordersAvailable),
      );
    }
  }, [ordersAvailable]);

  // Filter orders based on search and status
  useEffect(() => {
    if (orderType === "cake-order") {
      const filteredOrders = orders
        .filter((order) => {
          const matchesSearch =
            order.customerName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.customerPhone.includes(searchQuery) ||
            order.id
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.nguoiLam
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            getCakeTypeLabel(order.cakeType)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.cakeType
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.customerPhone
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (order.creamType === "kem-thuong"
              ? "kem thuong"
              : "kem whip"
            )
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.creamType
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          const matchesOrderType =
            order.orderType === orderType;

          const matchesStatus = statusCakeOrderFilter.includes(
            order.status,
          );

          const matchesTho =
            filterTho === "all" || order.nguoiLam === filterTho;

          const matchesDateRange = (() => {
            if (!dateRange.from) return true;

            // Use the selected date field (orderDate or deliveryDate)
            const dateToCompare =
              dateFilterType === "orderDate"
                ? order.orderDate
                : order.deliveryDate;
            const targetDate = new Date(dateToCompare);
            const fromDate = new Date(dateRange.from);
            const toDate = dateRange.to
              ? new Date(dateRange.to)
              : null;

            // Reset time parts for accurate date comparison
            fromDate.setHours(0, 0, 0, 0);
            targetDate.setHours(0, 0, 0, 0);

            if (toDate) {
              toDate.setHours(23, 59, 59, 999);
              return (
                targetDate >= fromDate && targetDate <= toDate
              );
            } else {
              // If no "to" date, show all orders from "from" date onwards
              return targetDate >= fromDate;
            }
          })();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesDateRange &&
            matchesTho &&
            matchesOrderType
          );
        })
        .sort((a, b) => {
          // Sort by the selected date filter type (earliest first for delivery, most recent for order)
          const dateA =
            dateFilterType === "orderDate"
              ? a.orderDate
              : a.deliveryDate;
          const dateB =
            dateFilterType === "orderDate"
              ? b.orderDate
              : b.deliveryDate;

          const timeA = new Date(dateA).getTime();
          const timeB = new Date(dateB).getTime();

          // Add time comparison if available (for delivery date + time)
          if (
            dateFilterType === "deliveryDate" &&
            a.deliveryTime &&
            b.deliveryTime
          ) {
            if (timeA === timeB) {
              // If same date, sort by time (ascending for delivery)
              return a.deliveryTime.localeCompare(
                b.deliveryTime,
              );
            }
          }

          // For delivery date: ascending (earliest first)
          // For order date: descending (most recent first)
          return dateFilterType === "deliveryDate"
            ? timeA - timeB
            : timeB - timeA;
        });
      setFilteredOrders(filteredOrders);
    } else {
      console.log("1233333333");
      const filteredOrders = ordersAvailable
        .filter((order) => {
          const matchesSearch =
            order.customerName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.customerPhone.includes(searchQuery) ||
            order.id
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.nguoiLam
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            getCakeTypeLabel(order.cakeType)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.cakeType
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.customerPhone
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (order.creamType === "kem-thuong"
              ? "kem thuong"
              : "kem whip"
            )
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.creamType
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          const matchesOrderType =
            order.orderType === orderType;

          const matchesSource =
            order.orderSource == sourceFilterType ||
            sourceFilterType === "all";

          const matchesStatus =
            statusCakeAvailableFilter.includes(order.status);

          const matchesDateRange = (() => {
            if (!dateRangeCakeAvailable.from) return true;

            // Use the selected date field (orderDate or deliveryDate)
            const dateToCompare = order.orderDate;

            const targetDate = new Date(dateToCompare);
            const fromDate = new Date(
              dateRangeCakeAvailable.from,
            );
            const toDate = dateRangeCakeAvailable.to
              ? new Date(dateRangeCakeAvailable.to)
              : null;

            // Reset time parts for accurate date comparison
            fromDate.setHours(0, 0, 0, 0);
            targetDate.setHours(0, 0, 0, 0);

            if (toDate) {
              toDate.setHours(23, 59, 59, 999);
              return (
                targetDate >= fromDate && targetDate <= toDate
              );
            } else {
              // If no "to" date, show all orders from "from" date onwards
              return targetDate >= fromDate;
            }
          })();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesDateRange &&
            matchesOrderType &&
            matchesSource
          );
        })
        .sort((a, b) => {
          // Sort by the selected date filter type (earliest first for delivery, most recent for order)
          const dateA = a.orderDate;

          const dateB = b.orderDate;

          const timeA = new Date(dateA).getTime();
          const timeB = new Date(dateB).getTime();
          return timeB - timeA;
        });
      setFilteredOrders(filteredOrders);
    }
  }, [
    searchQuery,
    statusFilter,
    dateRange,
    dateRangeCakeAvailable,
    dateFilterType,
    orders,
    ordersAvailable,
    filterTho,
    orderType,
    statusCakeAvailableFilter,
    statusCakeOrderFilter,
    sourceFilterType,
  ]);

  useEffect(() => {
    if (!pendingAlertRef.current) return;

    const alert = pendingAlertRef.current;
    pendingAlertRef.current = null;

    if (alert.type === "toast") {
      toast.info(alert.message);
    }

    if (alert.type === "dialog") {
      setSuccessMessage({
        title: "Thông báo thay đổi",
        description: alert.message,
      });
      setShowSuccessDialog(true);
    }
  }, [orders]);

  // Load orders from Firestore when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserFromFirestore();
      doSearch();
    }
  }, [isAuthenticated]);

  // Load orders from Firestore when authenticated
  useEffect(() => {
    if (isAuthenticated && isDataLoaded) {
      doSearch();
    }
  }, [dateRange, dateRangeCakeAvailable, orderType]);

  const getOrderById = (id: string) => {
    if (orderType == "cake-order") {
      return orders.find((order) => order.id === id);
    } else {
      return ordersAvailable.find((order) => order.id === id);
    }
  };

  const isCurrentDate = (date: string) => {
    const currentDateFormatted = new Date().toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Ho_Chi_Minh",
      },
    );
    if (date == currentDateFormatted) {
      return true;
    }
    return false;
  };

  const sub4Days = (dateStr, days) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - days);

    return date.toLocaleDateString("en-CA");
  };

  const parseFormattedNumber = (value: string): number => {
    const cleanValue = value.replace(/\./g, "");
    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? 0 : numValue;
  };

  const formatNumber = (value: number | string): string => {
    if (!value && value !== 0) return "";
    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(/\./g, ""))
        : value;
    if (isNaN(numValue)) return "";
    return Math.floor(numValue)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle price input change with formatting
  const handleShipChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly === "") {
      setShipDisplay("");
      return;
    }
    // Format the number with dots
    const formatted = formatNumber(digitsOnly);
    setShipDisplay(formatted);
  };

  const removeImageList = async (imageUrls: string[]) => {
    try {
      const storage = getStorage();
      await Promise.all(
        imageUrls.map((url) => deleteObject(ref(storage, url))),
      );
      console.log("All images deleted");
    } catch (err) {
      console.error("Delete image list failed", err);
    }
  };

  const getOrderType = (orderType: string) => {
    switch (orderType) {
      case "cake-order":
        return "Bánh Yêu Cầu";
      case "cake-available":
        return "Bánh Sẵn";
      default:
        return orderType;
    }
  };

  const getNameNguoiLam = (nguoilam: Order["nguoiLam"]) => {
    const user = userSanxuat.find((u) => u.id === nguoilam);
    if (user) {
      return user.fullname;
    }
    return nguoilam;
  };

  const getNameNguoiGiao = (nguoigiao: Order["nguoiGiao"]) => {
    const user = userSales.find((u) => u.id === nguoigiao);
    if (user) {
      return user.fullname;
    }
    return nguoigiao;
  };

  // Function to load orders from Firestore
  const loadUserFromFirestore = async () => {
    // Only attempt to load from Firestore if db is initialized
    if (!db) {
      console.log(
        "Firebase not initialized, using localStorage only",
      );
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);

      const firestoreUserSale: UserSys[] = [];
      const firestoreUserSanxuat: UserSys[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Convert Firestore data to Order format
        const user: UserSys = {
          id: data.id,
          fullname: data.name,
        };

        const p = data.permission;
        if (p == "sale" || p == "pic_sale") {
          firestoreUserSale.push(user);
        } else {
          if (p == "sanxuat" || p == "pic_sx") {
            firestoreUserSanxuat.push(user);
          }
        }
      });

      setUserSales(firestoreUserSale);
      setUserSanxuat(firestoreUserSanxuat);
    } catch (error) {
      console.error(
        "Error loading orders from Firestore:",
        error,
      );
    }
  };

  const handleSaveOrder = async (
    order: Order,
    files: File[],
  ) => {
    setSavingOrder(true);
    try {
      // If Firebase is not initialized, save to localStorage only
      if (!db) {
        console.log(
          "Firebase not available, saving to localStorage only",
        );
        // Show error dialog
        setErrorMessage({
          title: "Tạo Đơn không thành công!",
          description:
            "Làm ơn kiểm tra lại kết nối mạng và thử lại.",
        });

        setIsLoading(false);
        setShowErrorDialog(true);
        setSavingOrder(false);

        return;
      }
      setIsLoading(true);
      const urls = await uploadImages(files);
      const newPhotos = Array.from(
        new Set([...order.photos, ...urls]),
      );
      const orderData = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        deliveryTime: order.deliveryTime,
        status: order.status,
        notes: order.notes,
        price: order.price,
        deposit: order.deposit,
        cakeType: order.cakeType,
        cakeSize: order.cakeSize,
        creamType: order.creamType,
        deliveryAddress: order.deliveryAddress,
        orderSource: order.orderSource,
        photos: newPhotos || [],
        createdBy: order.createdBy || "",
        nguoiLam: order.nguoiLam || "",
        paymentFull: order.paymentFull || false,
        nguoiGiao: order.nguoiGiao || "",
        ship: order.ship || 0,
        phukien: order.phukien || "",
        noidung: order.noidung || "",
        giaohangNotes: order.giaohangNotes || "",
        orderType: order.orderType || "cake-order",
        userLastUpdated: order.userLastUpdated || "",
      };

      // Check if this is a new order or updating an existing one
      const existingOrder = getOrderById(order.id);

      if (existingOrder) {
        // Update existing order in Firestore
        const orderRef = doc(db, "orders", order.id);
        await updateDoc(orderRef, orderData);
        console.log("Order updated in Firestore:", order.id);

        // Update local state
        if (orderType == "cake-order") {
          setOrders((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (o) => o.id === order.id,
            );
            if (index >= 0) {
              updated[index] = order;
            }
            return updated;
          });
        } else {
          setOrdersAvailable((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (o) => o.id === order.id,
            );
            if (index >= 0) {
              updated[index] = order;
            }
            return updated;
          });
        }

        // Show success dialog for update
        setSuccessMessage({
          title: "Cập nhật thành công!",
          description: `Đơn hàng cho ${order.customerName} đã được cập nhật.`,
        });
        setShowSuccessDialog(true);
      } else {
        // Add new order to Firestore
        const ordersRef = collection(db, "orders");
        const docRef = await addDoc(ordersRef, orderData);
        console.log(
          "New order added to Firestore with ID:",
          docRef.id,
        );

        // Update local state with the Firestore-generated ID
        const newOrder = { ...order, id: docRef.id };
        if (orderType == "cake-order") {
          setOrders((prev) => [...prev, newOrder]);
        } else {
          setOrdersAvailable((prev) => [...prev, newOrder]);
        }

        // Show success dialog for creation
        setSuccessMessage({
          title: "Tạo đơn hàng thành công!",
          description: `Đơn hàng cho khách hàng: ${order.customerName} đã được tạo thành công với mã là ${docRef.id.slice(0, 8)}.`,
        });
        setShowSuccessDialog(true);
      }

      // Reload orders from Firestore to ensure sync
      await doSearch();

      // Close the form after successful save
      setIsFormOpen(false);
      setFormAvailableOpen(false);
      setSelectedOrder(null);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving order to Firestore:", error);

      // Show error dialog
      setErrorMessage({
        title: "Tạo Đơn không thành công!",
        description:
          "Làm ơn kiểm tra lại kết nối mạng và thử lại.",
      });
      setShowErrorDialog(true);
    } finally {
      console.log("handleSaveOrder: finally");
      setIsLoading(false);
      setSavingOrder(false);
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        // Delete from Firestore if available
        if (db) {
          setIsLoading(true);
          const orderRef = doc(db, "orders", orderToDelete.id);
          removeImageList(orderToDelete.photos);
          await deleteDoc(orderRef);
          console.log(
            `Order ${orderToDelete.id} deleted from Firestore`,
          );

          // Update local state first (optimistic update)
          if (orderType == "cake-order") {
            setOrders((prev) =>
              prev.filter((o) => o.id !== orderToDelete.id),
            );
          } else {
            setOrdersAvailable((prev) =>
              prev.filter((o) => o.id !== orderToDelete.id),
            );
          }

          // Show success dialog
          setSuccessMessage({
            title: "Xóa đơn hàng thành công!",
            description: `Đơn ${orderToDelete.id.slice(0, 8)} đã được xóa.`,
          });
          setShowSuccessDialog(true);
          setIsLoading(false);
        } else {
          // Show success dialog for local-only deletion
          setSuccessMessage({
            title: "Xóa đơn hàng thành công!",
            description: `Đơn hàng ${orderToDelete.id.slice(0, 8)} đã được xóa.`,
          });
          setShowSuccessDialog(true);
          setIsLoading(false);
        }

        setOrderToDelete(null);
      } catch (error) {
        setIsLoading(false);
        console.error(
          "Error deleting order from Firestore:",
          error,
        );

        // Restore the order in local state if Firestore deletion failed
        if (orderType == "cake-order") {
          setOrders((prev) => [...prev, orderToDelete]);
        } else {
          setOrdersAvailable((prev) => [
            ...prev,
            orderToDelete,
          ]);
        }

        // Show error dialog
        setErrorMessage({
          title: "Xóa đơn không thành công",
          description: `Hãy kiểm tra lại kết nối mạng và thử lại`,
        });
        setShowErrorDialog(true);

        setOrderToDelete(null);
      }
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    if (orderType == "cake-order") {
      setIsFormOpen(true);
    }
    if (orderType == "cake-available") {
      setFormAvailableOpen(true);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    if (orderType == "cake-order") {
      setIsDetailsOpen(true);
    }
    if (orderType == "cake-available") {
      setIsOrderAvailableDetailOpen(true);
    }
  };

  const handleNewOrder = () => {
    setSelectedOrder(null);
    if (orderType == "cake-order") {
      setIsFormOpen(true);
    }
    if (orderType == "cake-available") {
      setFormAvailableOpen(true);
    }
  };

  const handleChangeStatus = (order: Order) => {
    setOrderToChangeStatus(order);
    setNewStatus(order.status);
    setPaymentImages([]);
    setIsPaidFull(order.paymentFull);
    setShipDisplay(formatNumber(order.ship));
  };

  const confirmStatusChange = async () => {
    if (orderToChangeStatus) {
      setIsLoading(true);
      try {
        console.log(
          "paymentImages.length: ",
          paymentImages.length,
        );
        const urls = await uploadImages(paymentImages);
        const newPhotos = Array.from(
          new Set([...orderToChangeStatus.photos, ...urls]),
        );
        const shipPrice =
          parseFormattedNumber(shipDisplay) || 0;
        setIsProcessingImages(false);
        console.log("urls: ", urls);
        // Update local state first

        if (orderType == "cake-order") {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderToChangeStatus.id
                ? {
                    ...o,
                    status: newStatus,
                    paymentFull: isPaidFull,
                    photos: newPhotos,
                    ship: shipPrice,
                  }
                : o,
            ),
          );
        } else {
          setOrdersAvailable((prev) =>
            prev.map((o) =>
              o.id === orderToChangeStatus.id
                ? {
                    ...o,
                    status: newStatus,
                    paymentFull: isPaidFull,
                    photos: newPhotos,
                    ship: shipPrice,
                  }
                : o,
            ),
          );
        }

        // Update in Firestore if available
        if (db) {
          const orderRef = doc(
            db,
            "orders",
            orderToChangeStatus.id,
          );
          await updateDoc(orderRef, {
            status: newStatus,
            paymentFull: isPaidFull,
            photos: newPhotos,
            ship: shipPrice,
          });
          console.log(
            `Order ${orderToChangeStatus.id} status updated to ${newStatus} in Firestore`,
          );

          // Show success dialog
          setSuccessMessage({
            title: "Cập nhật thành công!",
            description: "",
          });
          setShowSuccessDialog(true);
        } else {
          // Show success dialog for local-only update
          setSuccessMessage({
            title: "Cập nhật thành công!!",
            description: "",
          });
          setShowSuccessDialog(true);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error(
          "Error updating order status in Firestore:",
          error,
        );

        // Show error dialog
        setErrorMessage({
          title: "Failed to Update Status",
          description: `There was an error updating the order status in Firestore. The status has been updated locally, but may not be synced to the cloud.`,
        });
        setShowErrorDialog(true);
      } finally {
        setIsLoading(false);
        setShipDisplay("");
        setOrderToChangeStatus(null);
        setPaymentImages([]);
        setIsPaidFull(false);
      }
    }
  };

  const handleChangeNguoiLam = (
    order: Order,
    value: string,
  ) => {
    setOrderToChangeNguoiLam(order);
    setNewNguoiLam(value);
  };

  const handleChangeNguoiGiao = (
    order: Order,
    value: string,
  ) => {
    setOrderToChangeNguoiGiao(order);
    setNewNguoiGiao(value);
  };

  const confirmNguoiGiaoChange = async () => {
    if (orderToChangeNguoiGiao) {
      try {
        // Update local state first
        if (orderType == "cake-order") {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderToChangeNguoiGiao.id
                ? { ...o, nguoiGiao: newNguoiGiao }
                : o,
            ),
          );
        } else {
          setOrdersAvailable((prev) =>
            prev.map((o) =>
              o.id === orderToChangeNguoiGiao.id
                ? { ...o, nguoiGiao: newNguoiGiao }
                : o,
            ),
          );
        }

        // Update in Firestore if available
        if (db) {
          const orderRef = doc(
            db,
            "orders",
            orderToChangeNguoiGiao.id,
          );
          await updateDoc(orderRef, {
            nguoiGiao: newNguoiGiao,
          });
          console.log(
            `Đơn ${orderToChangeNguoiGiao.id} nguoi gia hang updated to ${getNameNguoiGiao(newNguoiGiao)} in Firestore`,
          );

          // Show success dialog
          setSuccessMessage({
            title: "Thay đổi người giao hàng thành công!",
            description: `Đơn ${orderToChangeNguoiGiao.id.slice(0, 8)} đã giao cho "${getNameNguoiGiao(newNguoiGiao)}" làm`,
          });
          setShowSuccessDialog(true);
        } else {
          // Show success dialog for local-only update
          setSuccessMessage({
            title: "Thay đổi người giao hàng thành công!",
            description: `Đơn ${orderToChangeNguoiGiao.id.slice(0, 8)} đã giao cho "${getNameNguoiGiao(newNguoiGiao)}" làm`,
          });
          setShowSuccessDialog(true);
        }
      } catch (error) {
        console.error(
          "Error updating nguoiLam in Firestore:",
          error,
        );

        // Show error dialog
        setErrorMessage({
          title: "Đã xảy ra lỗi, thay đổi không thành công",
          description: `There was an error updating the Người làm field in Firestore. The assignment has been updated locally, but may not be synced to the cloud.`,
        });
        setShowErrorDialog(true);
      } finally {
        setOrderToChangeNguoiGiao(null);
      }
    }
  };

  const confirmNguoiLamChange = async () => {
    if (orderToChangeNguoiLam) {
      try {
        // Update local state first
        if (orderType == "cake-order") {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderToChangeNguoiLam.id
                ? { ...o, nguoiLam: newNguoiLam }
                : o,
            ),
          );
        } else {
          setOrdersAvailable((prev) =>
            prev.map((o) =>
              o.id === orderToChangeNguoiLam.id
                ? { ...o, nguoiLam: newNguoiLam }
                : o,
            ),
          );
        }

        // Update in Firestore if available
        if (db) {
          const orderRef = doc(
            db,
            "orders",
            orderToChangeNguoiLam.id,
          );
          await updateDoc(orderRef, {
            nguoiLam: newNguoiLam,
          });
          console.log(
            `Đơn ${orderToChangeNguoiLam.id} nguoiLam updated to ${getNameNguoiLam(newNguoiLam)} in Firestore`,
          );

          // Show success dialog
          setSuccessMessage({
            title: "Thay đổi người làm thành công!",
            description: `Đơn ${orderToChangeNguoiLam.id.slice(0, 8)} đã giao cho "${getNameNguoiLam(newNguoiLam)}" làm`,
          });
          setShowSuccessDialog(true);
        } else {
          // Show success dialog for local-only update
          setSuccessMessage({
            title: "Thay đổi người làm thành công!",
            description: `Đơn ${orderToChangeNguoiLam.id.slice(0, 8)} đã giao cho "${getNameNguoiLam(newNguoiLam)}" làm`,
          });
          setShowSuccessDialog(true);
        }
      } catch (error) {
        console.error(
          "Error updating nguoiLam in Firestore:",
          error,
        );

        // Show error dialog
        setErrorMessage({
          title: "Đã xảy ra lỗi, thay đổi không thành công",
          description: `There was an error updating the Người làm field in Firestore. The assignment has been updated locally, but may not be synced to the cloud.`,
        });
        setShowErrorDialog(true);
      } finally {
        setOrderToChangeNguoiLam(null);
      }
    }
  };

  const buildDeliveryDateTime = (
    deliveryDate: string, // "2026-01-29"
    deliveryTime: string, // "16:01"
  ) => {
    const [year, month, day] = deliveryDate
      .split("-")
      .map(Number);
    const [hours, minutes] = deliveryTime
      .split(":")
      .map(Number);

    // JS month bắt đầu từ 0
    return new Date(year, month - 1, day, hours, minutes, 0);
  };

  const getDiffMinutes = (
    deliveryDate: string,
    deliveryTime: string,
  ) => {
    const now = new Date();
    const delivery = buildDeliveryDateTime(
      deliveryDate,
      deliveryTime,
    );

    return (delivery.getTime() - now.getTime()) / (1000 * 60);
  };

  const isNearDelivery = (order: Order) => {
    const thresholdMinutes = 30;
    const diffMinutes = getDiffMinutes(
      order?.deliveryDate || "",
      order?.deliveryTime || "",
    );

    return diffMinutes <= thresholdMinutes;
  };

  const getDeliveryTextColor = (order: Order) => {
    if (!order) return "";
    if (order.status == "delivered") return "";
    const thresholdMinutes = 30;
    const diffMinutes = getDiffMinutes(
      order.deliveryDate,
      order.deliveryTime,
    );
    if (diffMinutes <= 40) return "text-red-700 font-bold";
    if (diffMinutes <= 60) return "text-orange-500";
    return "";
  };

  const clearDateFilters = () => {
    setDateRange({ from: "", to: null });
  };

  const handleLogin = async (
    username: string,
    password: string,
  ) => {
    setLoginLoading(true);
    setLoginError("");

    // If Firebase is not initialized, use a fallback authentication
    if (!db) {
      console.log(
        "Firebase not available, using fallback authentication",
      );

      // Simple fallback authentication for demo purposes
      // In production, you should have a proper backend for this
      if (username === "admin" && password === "admin") {
        const authData = {
          isLoggedIn: true,
          timestamp: Date.now(),
          username: username,
          permission: "admin",
          userId: "local-user",
          pass: password,
          changed: false,
        };
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(authData),
        );
        setIsAuthenticated(true);
        setUserPermission("admin");
        setLoginLoading(false);
        return;
      } else {
        setLoginError(
          "Invalid username or password (Firebase not configured)",
        );
        setLoginLoading(false);
        return;
      }
    }

    try {
      // Query Firestore users collection
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoginError("Invalid username or password");
        setLoginLoading(false);
        return;
      }

      // Check if password matches
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.pass !== password) {
        setLoginError("Invalid username or password");
        setLoginLoading(false);
        return;
      }

      // Login successful
      const authData = {
        isLoggedIn: true,
        timestamp: Date.now(),
        username: username,
        permission: userData.permission || "user",
        userId: userDoc.id,
        name: userData.name || "user",
        pass: userData.pass || "",
        changed: userData.changed || false,
      };
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(authData),
      );
      setIsAuthenticated(true);
      setUserPermission(userData.permission || "user");
      setCurrentUser({
        id: userDoc.id,
        username: username,
        name: userData.name,
        pass: userData.pass,
        changed: userData.changed,
      });
      console.log("userData.name: ", userData.name);
      setShowLoginSuccess(true);

      setTimeout(() => setShowLoginSuccess(false), 3000);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        "Failed to connect to Firebase. Please check your configuration.",
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const doSearch = async () => {
    if (!db) {
      console.log(
        "Firebase not initialized, using localStorage only",
      );
      return;
    }
    console.log("do search");
    try {
      setIsLoading(true);
      const ordersRef = collection(db, "orders");
      const fromDate =
        orderType === "cake-order"
          ? dateRange.from
          : dateRangeCakeAvailable.from;
      const toDate =
        orderType === "cake-order"
          ? dateRange.to
          : dateRangeCakeAvailable.to;

      const key =
        orderType === "cake-order"
          ? "deliveryDate"
          : "orderDate";
      console.log("key: ", key);
      console.log("fromDate: ", fromDate);
      console.log("toDate: ", toDate);
      const q = query(
        ordersRef,
        where(key, ">=", fromDate),
        where(key, "<=", toDate),
      );
      const querySnapshot = await getDocs(q);
      const firestoreOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        var deliveryDate = data.deliveryDate || "";
        if (orderType == "cake-available") {
          if (
            data.status == "delivered" &&
            deliveryDate == ""
          ) {
            deliveryDate = new Date().toLocaleDateString(
              "en-CA",
              {
                timeZone: "Asia/Ho_Chi_Minh",
              },
            );
          }
        }
        // Convert Firestore data to Order format
        const order: Order = {
          id: doc.id,
          customerName: data.customerName || "",
          customerPhone: data.customerPhone || "",
          customerEmail: data.customerEmail || "",
          orderDate: data.orderDate || "",
          deliveryDate: deliveryDate,
          deliveryTime: data.deliveryTime || "",
          status: data.status || "pending",
          notes: data.notes || "",
          price: data.price || 0,
          deposit: data.deposit || 0,
          cakeType: data.cakeType || "banh-sinh-nhat",
          cakeSize: data.cakeSize || "",
          creamType: data.creamType || "kem-thuong",
          deliveryAddress: data.deliveryAddress || "",
          orderSource: data.orderSource || "page",
          photos: data.photos || [],
          createdBy: data.createdBy || "",
          nguoiLam: data.nguoiLam || "",
          paymentFull: data.paymentFull || false,
          nguoiGiao: data.nguoiGiao || "",
          ship: data.ship || 0,
          phukien: data.phukien || "",
          noidung: data.noidung || "",
          giaohangNotes: data.giaohangNotes || "",
          orderType: data.orderType || "cake-order",
          userLastUpdated: data.userLastUpdated || "",
        };

        firestoreOrders.push(order);
      });
      if (orderType == "cake-order") {
        setOrders(firestoreOrders);
      } else {
        setOrdersAvailable(firestoreOrders);
      }
      setIsDataLoaded(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(
        "Error loading orders from Firestore:",
        error,
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (oldPassword !== currentUser.pass) {
      toast.error("Mật khẩu cũ không đúng");
      return;
    }

    try {
      setLoadingChangedPass(true);
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        pass: newPassword,
        changed: true,
      });
      setSuccessMessage({
        title: "Thay đổi mật khẩu thành công",
        description: "",
      });
      setShowSuccessDialog(true);
      setOpenChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setLoadingChangedPass(false);
    } catch (error) {
      setErrorMessage({
        title: "Cập nhật mật khẩu thất bại",
        description: "",
      });
      setShowErrorDialog(true);
      console.error(error);
    } finally {
      setLoadingChangedPass(false);
      setOldPassword("");
      setNewPassword("");
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      case "delivered":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  const getStatusColor2 = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      case "delivered":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  const getNguoilamLabel = (status: Order["status"]) => {
    return "thong";
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Chờ xử lí";
      case "in-progress":
        return "Đang xử lí";
      case "completed":
        return "Đã hoàn thành";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusLabel2 = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Chưa có sẵn";
      case "in-progress":
        return "Chưa có sẵn";
      case "completed":
        return "Có Sẵn";
      case "delivered":
        return "Đã Bán";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getCakeTypeLabel = (cakeType: string) => {
    switch (cakeType) {
      case "banh-sinh-nhat":
        return "Bánh sinh nhật";
      case "banh-an-vat":
        return "Bánh Ăn Vặt";
      case "tiramisu":
        return "Tiramisu";
      case "bltm":
        return "BLTM";
      case "banh-tet":
        return "Bánh tết";
      case "cup-cake":
        return "Cup cake";
      default:
        return cakeType;
    }
  };

  const getOrderSourceLabel = (orderSource: string) => {
    switch (orderSource) {
      case "page":
        return "Page";
      case "shoppee":
        return "Shoppee";
      case "ticktok":
        return "Ticktok";
      case "in-shop-vanphu":
        return "Cửa hàng văn phú";
      case "in-shop-vankhe":
        return "Cửa hàng văn khê";
      case "fb_vanphu":
        return "FB Văn Phú";
      case "fb_vankhe":
        return " FB Văn Khê";
      default:
        return orderSource;
    }
  };

  const handleTabChange = (value: string) => {
    console.log("Tab changed:", value);
    setOrderType(value);
    if (value === "cake-available" && orderType != value) {
      // load bánh sẵn
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      const sub4today = new Date(
        new Date().setDate(new Date().getDate() - 3),
      ).toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      dateRangeCakeAvailable.from = sub4today;
      dateRangeCakeAvailable.to = today;
      setStatusCakeAvailableFilter(["completed"]);
    }
  };

  const toggleStatusAvailable = (value: string) => {
    setStatusCakeAvailableFilter((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const toggleStatusCakeOrder = (value: string) => {
    setStatusCakeOrderFilter((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (
    dateString: string,
    timeString: string,
  ) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    if (timeString) {
      return `${formattedDate}  ${timeString}`;
    }
    return formattedDate;
  };
  const getMoneyRemain = (order: Order) => {
    // Format number with dots as thousand separators
    return order.price - order.deposit;
  };

  const formatRevenue = (amount: number) => {
    // Format number with dots as thousand separators
    return amount
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Convert yyyy-MM-dd to dd/MM/yyyy for display
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Convert dd/MM/yyyy to yyyy-MM-dd for storage
  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Handle date input with dd/MM/yyyy format
  const handleDateInput = (
    value: string,
    field: "from" | "to",
  ) => {
    // Remove any non-numeric and non-slash characters
    let cleaned = value.replace(/[^\d/]/g, "");

    // Auto-add slashes
    if (cleaned.length >= 2 && !cleaned.includes("/")) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (
      cleaned.length >= 5 &&
      cleaned.split("/").length === 2
    ) {
      const parts = cleaned.split("/");
      cleaned =
        parts[0] + "/" + parts[1] + "/" + cleaned.slice(5);
    }

    // Limit to dd/MM/yyyy format (10 characters)
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }

    // Try to convert to yyyy-MM-dd format if complete
    if (cleaned.length === 10) {
      const convertedDate = parseDateFromInput(cleaned);
      if (convertedDate) {
        setDateRange({
          ...dateRange,
          [field]: convertedDate,
        });
        return;
      }
    }

    // Store the partial input as-is for incomplete dates
    // We'll store it in a temporary state for display purposes
    if (field === "from") {
      setDateRange({
        ...dateRange,
        from:
          cleaned.length === 10
            ? parseDateFromInput(cleaned)
            : dateRange.from,
      });
    } else {
      setDateRange({
        ...dateRange,
        to:
          cleaned.length === 10
            ? parseDateFromInput(cleaned)
            : dateRange.to,
      });
    }
  };

  // Handle date input with dd/MM/yyyy format
  const handleDateInputCakeAvailable = (
    value: string,
    field: "from" | "to",
  ) => {
    // Remove any non-numeric and non-slash characters
    let cleaned = value.replace(/[^\d/]/g, "");

    // Auto-add slashes
    if (cleaned.length >= 2 && !cleaned.includes("/")) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (
      cleaned.length >= 5 &&
      cleaned.split("/").length === 2
    ) {
      const parts = cleaned.split("/");
      cleaned =
        parts[0] + "/" + parts[1] + "/" + cleaned.slice(5);
    }

    // Limit to dd/MM/yyyy format (10 characters)
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }

    // Try to convert to yyyy-MM-dd format if complete
    if (cleaned.length === 10) {
      const convertedDate = parseDateFromInput(cleaned);
      if (convertedDate) {
        setDateRangeCakeAvailable({
          ...dateRangeCakeAvailable,
          [field]: convertedDate,
        });
        return;
      }
    }

    // Store the partial input as-is for incomplete dates
    // We'll store it in a temporary state for display purposes
    if (field === "from") {
      setDateRangeCakeAvailable({
        ...dateRangeCakeAvailable,
        from:
          cleaned.length === 10
            ? parseDateFromInput(cleaned)
            : dateRangeCakeAvailable.from,
      });
    } else {
      setDateRangeCakeAvailable({
        ...dateRangeCakeAvailable,
        to:
          cleaned.length === 10
            ? parseDateFromInput(cleaned)
            : dateRangeCakeAvailable.to,
      });
    }
  };

  // Resize and compress image
  const resizeAndCompressImage = (
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("No canvas context");

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) reject("Blob conversion failed");
              else resolve(blob);
            },
            "image/jpeg",
            quality,
          );
        };
        img.src = reader.result as string;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function uploadResizedImage(
    file: File,
  ): Promise<string> {
    const storage = getStorage();
    const blob = await resizeAndCompressImage(file);

    const imageRef = ref(
      storage,
      `images/${Date.now()}-${file.name}`,
    );

    await uploadBytes(imageRef, blob);

    const url = await getDownloadURL(imageRef);
    console.log("URL: ", url);
    return url;
  }

  async function uploadImages(files: File[]) {
    const uploads = files.map((file) =>
      uploadResizedImage(file),
    );
    return await Promise.all(uploads); // string[]
  }

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(
      (o) => o.status === "pending",
    ).length,
    inProgress: filteredOrders.filter(
      (o) => o.status === "in-progress",
    ).length,
    completed: filteredOrders.filter(
      (o) =>
        o.status === "completed" || o.status === "delivered",
    ).length,
    delivered: filteredOrders.filter(
      (o) => o.status === "delivered",
    ).length,
    revenue: filteredOrders.reduce(
      (sum, o) =>
        sum + (o.paymentFull ? o.price : o.deposit || 0),
      0,
    ),
  };
  const statsAvailable = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(
      (o) => o.status === "pending",
    ).length,
    kho_vanphu: filteredOrders.filter(
      (o) => o.orderSource === "in-shop-vanphu",
    ).length,
    kho_vankhe: filteredOrders.filter(
      (o) => o.orderSource === "in-shop-vankhe",
    ).length,

    revenue: filteredOrders.reduce(
      (sum, o) =>
        sum + (o.status === "delivered" ? o.deposit : 0),
      0,
    ),
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cake className="w-8 h-8 flex-shrink-0" />
              <h1 className="text-xl md:text-2xl">
                Quản Lí Đơn Hàng ({currentUser.username})
              </h1>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {(userPermission === "admin" ||
                userPermission === "sale" ||
                userPermission === "pic_sale") &&
                orderType == "cake-order" && (
                  <Button
                    onClick={handleNewOrder}
                    className="flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Đơn
                  </Button>
                )}
              {(userPermission === "admin" ||
                userPermission === "sanxuat" ||
                userPermission === "pic_sx") &&
                orderType == "cake-available" && (
                  <Button
                    onClick={handleNewOrder}
                    className="flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Đơn
                  </Button>
                )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Thoát
              </Button>
            </div>
          </div>

          {/* Stats Cards */}

          <Tabs
            value={orderType}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="cake-order"
                className="
      data-[state=active]:bg-black
      data-[state=active]:text-white
    "
              >
                Bánh Đặt
              </TabsTrigger>

              <TabsTrigger
                value="cake-available"
                className="
      data-[state=active]:bg-black
      data-[state=active]:text-white
    "
              >
                Bánh sẵn
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  Tổng đơn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{stats.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  Chờ xử lí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{stats.pending}</p>
              </CardContent>
            </Card>
            {orderType == "cake-order" ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      Đang xử lí
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{stats.inProgress}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      Hoàn thành
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{stats.completed}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      Đã giao khách
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{stats.delivered}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      Cửa hàng Văn Phú
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{statsAvailable.kho_vanphu}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">
                      Cửa hàng Văn Khê
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{statsAvailable.kho_vankhe}</p>
                  </CardContent>
                </Card>
              </>
            )}

            {userPermission == "admin" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">
                    Tiền nhận
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    {orderType == "cake-order"
                      ? formatRevenue(stats.revenue)
                      : formatRevenue(statsAvailable.revenue)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filters */}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm đơn hàng..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="pl-9"
                    />
                  </div>
                </div>

                {orderType != "cake-order" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-muted-foreground">
                        Tìm kiếm theo trạng thái
                      </label>

                      <div className="flex flex-wrap gap-4">
                        {STATUS_LIST_CAKE_AVAILABLE.map(
                          (item) => (
                            <label
                              key={item.value}
                              className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                checked={statusCakeAvailableFilter.includes(
                                  item.value,
                                )}
                                onChange={() =>
                                  toggleStatusAvailable(
                                    item.value,
                                  )
                                }
                                className="h-4 w-4"
                              />
                              <span className="text-sm whitespace-nowrap">
                                {item.label}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}

                {orderType == "cake-order" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-muted-foreground">
                        Tìm kiếm theo trạng thái
                      </label>

                      <div className="flex flex-wrap gap-4">
                        {STATUS_LIST_CAKE_ORDER.map((item) => (
                          <label
                            key={item.value}
                            className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={statusCakeOrderFilter.includes(
                                item.value,
                              )}
                              onChange={() =>
                                toggleStatusCakeOrder(
                                  item.value,
                                )
                              }
                              className="h-4 w-4"
                            />
                            <span className="text-sm whitespace-nowrap">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {orderType == "cake-order" && (
                    <>
                      <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Tìm theo thợ
                        </label>
                        <Select
                          value={filterTho}
                          onValueChange={setFilterTho}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="all" value="all">
                              Tất cả thợ
                            </SelectItem>
                            {userSanxuat.map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id}
                              >
                                {getNameNguoiLam(user.id)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Tìm theo ngày
                      </label>
                      <Select
                        value={dateFilterType}
                        onValueChange={setDateFilterType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ngày nhận" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            key="deliveryDate"
                            value="deliveryDate"
                          >
                            Ngày nhận
                          </SelectItem>
                          <SelectItem
                            key="orderDate"
                            value="orderDate"
                          >
                            Ngày tạo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}
                    </>
                  )}
                  {orderType !== "cake-order" && (
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Tìm theo cửa hàng
                      </label>
                      <Select
                        value={sourceFilterType}
                        onValueChange={setSourceFilterType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cửa hàng văn  phú" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key="all" value="all">
                            Tất cả cửa hàng
                          </SelectItem>
                          <SelectItem
                            key="in-shop-vanphu"
                            value="in-shop-vanphu"
                          >
                            {getOrderSourceLabel(
                              "in-shop-vanphu",
                            )}
                          </SelectItem>
                          <SelectItem
                            key="in-shop-vankhe"
                            value="in-shop-vankhe"
                          >
                            {getOrderSourceLabel(
                              "in-shop-vankhe",
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {orderType == "cake-order" ? (
                    <>
                      <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Từ ngày
                        </label>
                        <Input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              from: e.target.value,
                            })
                          }
                          placeholder="dd/MM/yyyy"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Đến ngày
                        </label>
                        <Input
                          type="date"
                          value={dateRange.to || ""}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              to: e.target.value,
                            })
                          }
                          placeholder="dd/MM/yyyy"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Từ ngày
                        </label>
                        <Input
                          type="date"
                          value={dateRangeCakeAvailable.from}
                          onChange={(e) =>
                            setDateRangeCakeAvailable({
                              ...dateRangeCakeAvailable,
                              from: e.target.value,
                            })
                          }
                          placeholder="dd/MM/yyyy"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Đến ngày
                        </label>
                        <Input
                          type="date"
                          value={
                            dateRangeCakeAvailable.to || ""
                          }
                          onChange={(e) =>
                            setDateRangeCakeAvailable({
                              ...dateRangeCakeAvailable,
                              to: e.target.value,
                            })
                          }
                          placeholder="dd/MM/yyyy"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {orderType == "cake-order"
                  ? "Danh Sách Đơn"
                  : "Danh Sách Bánh Sẵn"}{" "}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Cake className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Kết quả tìm kiếm không có Đơn nào.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  {orderType == "cake-order" ? (
                    <div className="md:hidden space-y-4">
                      {filteredOrders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground">
                                    Mã đơn
                                  </p>
                                  <p className="font-mono text-sm truncate">
                                    {order.id.slice(0, 8)}
                                  </p>
                                </div>
                                <Badge
                                  className={`${getStatusColor(order.status)} ${(userPermission == "sanxuat" && order.status === "delivered") || (userPermission == "pic_sx" && order.status === "delivered") || (userPermission == "sale" && order.nguoiGiao !== currentUser.username) || (userPermission == "sanxuat" && order.nguoiLam !== currentUser.username) ? "pointer-events-none" : "cursor-pointer"} flex-shrink-0`}
                                  onClick={() =>
                                    handleChangeStatus(order)
                                  }
                                >
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Khách hàng
                                  </p>
                                  <p className="font-medium">
                                    {order.customerName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.customerPhone}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Loại Bánh
                                    </p>
                                    <p>
                                      {getCakeTypeLabel(
                                        order.cakeType,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Size
                                    </p>
                                    <p className="capitalize">
                                      {order.cakeSize}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Loại Kem
                                    </p>
                                    <p>
                                      {order.creamType ===
                                      "kem-thuong"
                                        ? "Kem thuong"
                                        : "Kem whip"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Thời gian nhận
                                    </p>
                                    <p
                                      className={getDeliveryTextColor(
                                        order,
                                      )}
                                    >
                                      {formatDateTime(
                                        order.deliveryDate,
                                        order.deliveryTime ||
                                          "",
                                      )}
                                    </p>
                                  </div>
                                  {(userPermission === "sale" ||
                                    userPermission ===
                                      "admin" ||
                                    userPermission ===
                                      "pic_sale") && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Tiền phải thu
                                      </p>
                                      <span
                                        className={`capitalize ${
                                          !order.paymentFull
                                            ? "text-red-500"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {order.paymentFull ==
                                        false
                                          ? formatRevenue(
                                              getMoneyRemain(
                                                order,
                                              ),
                                            )
                                          : "Đã trả hết"}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Người làm
                                    </p>
                                    <p>
                                      {userPermission ===
                                        "admin" ||
                                      userPermission ===
                                        "pic_sx" ||
                                      userPermission ===
                                        "sanxuat" ? (
                                        <Select
                                          value={
                                            order.nguoiLam || ""
                                          }
                                          onValueChange={(
                                            value,
                                          ) => {
                                            handleChangeNguoiLam(
                                              order,
                                              value,
                                            );
                                          }}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Chọn..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem
                                              key="N/A"
                                              value="N/A"
                                            >
                                              ...
                                            </SelectItem>

                                            {userSanxuat.map(
                                              (user) => (
                                                <SelectItem
                                                  key={user.id}
                                                  value={
                                                    user.id
                                                  }
                                                >
                                                  {getNameNguoiLam(
                                                    user.id,
                                                  )}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <span>
                                          {getNameNguoiLam(
                                            order.nguoiLam,
                                          ) || "N/A"}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  {userPermission == "sale" && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Người giao hàng
                                      </p>
                                      <p>
                                        {order.nguoiGiao
                                          .length > 0 &&
                                        order.nguoiGiao !=
                                          "N/A" &&
                                        order.nguoiGiao !=
                                          currentUser.username ? (
                                          <span>
                                            {getNameNguoiGiao(
                                              order.nguoiGiao,
                                            ) || "N/A"}
                                          </span>
                                        ) : (
                                          <Select
                                            value={
                                              order.nguoiGiao ||
                                              "Chọn..."
                                            }
                                            onValueChange={(
                                              value,
                                            ) => {
                                              handleChangeNguoiGiao(
                                                order,
                                                value,
                                              );
                                            }}
                                          >
                                            <SelectTrigger className="w-32">
                                              <SelectValue placeholder="Chọn..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem
                                                key="N/A"
                                                value="N/A"
                                              >
                                                ...
                                              </SelectItem>
                                              <SelectItem
                                                key={
                                                  currentUser.username
                                                }
                                                value={
                                                  currentUser.username
                                                }
                                              >
                                                {getNameNguoiGiao(
                                                  currentUser.username,
                                                )}
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                  {(userPermission ===
                                    "admin" ||
                                    userPermission ===
                                      "pic_sale") && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Người giao hàng
                                      </p>
                                      <p>
                                        <Select
                                          value={
                                            order.nguoiGiao ||
                                            ""
                                          }
                                          onValueChange={(
                                            value,
                                          ) => {
                                            handleChangeNguoiGiao(
                                              order,
                                              value,
                                            );
                                          }}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Chọn..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem
                                              key="N/A"
                                              value="N/A"
                                            >
                                              ...
                                            </SelectItem>
                                            {userSales.map(
                                              (user) => (
                                                <SelectItem
                                                  key={user.id}
                                                  value={
                                                    user.id
                                                  }
                                                >
                                                  {getNameNguoiGiao(
                                                    user.id,
                                                  )}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    handleViewOrder(order)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem
                                </Button>
                                {(userPermission === "admin" ||
                                  (userPermission === "sale" &&
                                    order.status !==
                                      "delivered" &&
                                    order.status !==
                                      "cancelled" &&
                                    order.createdBy ===
                                      currentUser.username) ||
                                  userPermission ===
                                    "pic_sale") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                      handleEditOrder(order)
                                    }
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Sửa
                                  </Button>
                                )}
                                {userPermission === "admin" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteOrder(order)
                                    }
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="block md:hidden space-y-4">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-2xl border bg-background p-3 shadow-sm"
                        >
                          {/* IMAGE */}
                          <div
                            className="relative h-52 overflow-hidden rounded-xl mb-3"
                            onClick={() =>
                              setPreviewImage(
                                order.photos.length > 0
                                  ? order.photos[0]
                                  : "",
                              )
                            }
                          >
                            <img
                              src={
                                order.photos[0] ||
                                "/placeholder.png"
                              }
                              alt="cake"
                              className="h-full w-full object-contain"
                            />

                            {/* STATUS OVER IMAGE */}
                            <div className="absolute top-2 right-2">
                              <Badge
                                className={`${getStatusColor2(order.status)} text-white`}
                              >
                                {getStatusLabel2(order.status)}
                              </Badge>
                            </div>
                          </div>

                          {/* PRICE */}
                          <div className="text-center font-bold text-xl">
                            Giá: {formatNumber(order.price)} ₫
                          </div>

                          {/* ACTIONS */}
                          <div className="mt-3 flex justify-center gap-2">
                            {/* VIEW */}
                            <Button
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() =>
                                handleViewOrder(order)
                              }
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-xs">
                                Xem
                              </span>
                            </Button>

                            {/* EDIT */}
                            {(userPermission == "admin" ||
                              (order.status != "cancelled" &&
                                order.status != "pending" &&
                                order.status != "delivered") ||
                              (order.status == "pending" &&
                                (userPermission == "sanxuat" ||
                                  userPermission ==
                                    "pic_sx")) ||
                              (order.status == "delivered" &&
                                userPermission == "sale" &&
                                isCurrentDate(
                                  order.deliveryDate,
                                ))) && (
                              <Button
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() =>
                                  handleEditOrder(order)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="text-xs">
                                  Sửa
                                </span>
                              </Button>
                            )}

                            {/* DELETE */}
                            {userPermission == "admin" && (
                              <Button
                                variant="outline"
                                className="flex items-center gap-1 text-red-500"
                                onClick={() =>
                                  handleDeleteOrder(order)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="text-xs">
                                  Xóa
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Desktop Table View */}
                  {orderType == "cake-order" ? (
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã đơn</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Loại Bánh</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Loại Kem</TableHead>
                            <TableHead>
                              Thời gian nhận
                            </TableHead>
                            <TableHead>Người làm</TableHead>
                            <TableHead>
                              Người giao hàng
                            </TableHead>
                            {(userPermission === "sale" ||
                              userPermission === "pic_sale" ||
                              userPermission === "admin") && (
                              <TableHead>
                                Tiền phải thu
                              </TableHead>
                            )}
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                              Chức năng
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono">
                                {order.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>{order.customerName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.customerPhone}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getCakeTypeLabel(
                                  order.cakeType,
                                )}
                              </TableCell>
                              <TableCell className="capitalize">
                                {order.cakeSize}
                              </TableCell>
                              <TableCell>
                                {order.creamType ===
                                "kem-thuong"
                                  ? "Kem thuong"
                                  : "Kem whip"}
                              </TableCell>
                              <TableCell
                                className={getDeliveryTextColor(
                                  order,
                                )}
                              >
                                {formatDateTime(
                                  order.deliveryDate,
                                  order.deliveryTime || "",
                                )}
                              </TableCell>
                              <TableCell>
                                {userPermission === "admin" ||
                                userPermission === "pic_sx" ||
                                userPermission === "sanxuat" ? (
                                  <Select
                                    value={order.nguoiLam || ""}
                                    onValueChange={(value) => {
                                      handleChangeNguoiLam(
                                        order,
                                        value,
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Chọn..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        key="N/A"
                                        value="N/A"
                                      >
                                        ...
                                      </SelectItem>

                                      {userSanxuat.map(
                                        (user) => (
                                          <SelectItem
                                            key={user.id}
                                            value={user.id}
                                          >
                                            {getNameNguoiLam(
                                              user.id,
                                            )}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span>
                                    {getNameNguoiLam(
                                      order.nguoiLam,
                                    ) || "N/A"}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {userPermission === "admin" ||
                                userPermission ===
                                  "pic_sale" ? (
                                  <Select
                                    value={
                                      order.nguoiGiao || ""
                                    }
                                    onValueChange={(value) => {
                                      handleChangeNguoiGiao(
                                        order,
                                        value,
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Chọn..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        key="N/A"
                                        value="N/A"
                                      >
                                        ...
                                      </SelectItem>
                                      {userSales.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id}
                                        >
                                          {getNameNguoiGiao(
                                            user.id,
                                          )}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : userPermission === "sale" &&
                                  (order.nguoiGiao === "" ||
                                    order.nguoiGiao === "N/A" ||
                                    order.nguoiGiao ===
                                      currentUser.username) ? (
                                  <Select
                                    value={
                                      order.nguoiGiao || ""
                                    }
                                    onValueChange={(value) => {
                                      handleChangeNguoiGiao(
                                        order,
                                        value,
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Chọn..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        key="N/A"
                                        value="N/A"
                                      >
                                        ...
                                      </SelectItem>
                                      <SelectItem
                                        key={
                                          currentUser.username
                                        }
                                        value={
                                          currentUser.username
                                        }
                                      >
                                        {getNameNguoiGiao(
                                          currentUser.username,
                                        )}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span>
                                    {getNameNguoiGiao(
                                      order.nguoiGiao,
                                    ) || "N/A"}
                                  </span>
                                )}
                              </TableCell>
                              {(userPermission === "sale" ||
                                userPermission === "pic_sale" ||
                                userPermission === "admin") && (
                                <TableCell>
                                  <p
                                    className={`capitalize ${
                                      !order.paymentFull
                                        ? "text-red-500"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {order.paymentFull == false
                                      ? formatRevenue(
                                          getMoneyRemain(order),
                                        )
                                      : "Đã trả hết"}
                                  </p>
                                </TableCell>
                              )}

                              <TableCell>
                                <Badge
                                  className={`${getStatusColor(order.status)} ${(userPermission == "sanxuat" && order.status === "delivered") || (userPermission == "pic_sx" && order.status === "delivered") || (userPermission == "sale" && order.nguoiGiao !== currentUser.username) || (userPermission == "sanxuat" && order.nguoiLam !== currentUser.username) || (order.status === "cancelled" && userPermission != "admin") ? "pointer-events-none" : "cursor-pointer"}`}
                                  onClick={() =>
                                    handleChangeStatus(order)
                                  }
                                >
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleViewOrder(order)
                                    }
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {(userPermission ===
                                    "admin" ||
                                    userPermission ===
                                      "pic_sale" ||
                                    (userPermission ===
                                      "sale" &&
                                      order.status !==
                                        "delivered" &&
                                      order.status !==
                                        "cancelled" &&
                                      order.createdBy ===
                                        currentUser.username)) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleEditOrder(order)
                                      }
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {userPermission ===
                                    "admin" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteOrder(order)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="bg-transparent">
                        <TableBody>
                          <TableRow className="grid grid-cols-4 gap-4">
                            {filteredOrders.map((order) => (
                              <TableCell
                                key={order.id}
                                className="w-[260px] h-[330px] p-3 border-2"
                              >
                                <div className="flex h-full flex-col gap-2">
                                  {/* 1️⃣ IMAGE */}
                                  <div className="basis-[70%] overflow-hidden rounded-lg">
                                    <img
                                      src={
                                        order.photos.length > 0
                                          ? order.photos[0]
                                          : ""
                                      }
                                      alt="cake"
                                      className="h-full w-full object-contain cursor-pointer"
                                      onClick={() =>
                                        setPreviewImage(
                                          order.photos.length >
                                            0
                                            ? order.photos[
                                                order.photos
                                                  .length - 1
                                              ]
                                            : "",
                                        )
                                      }
                                    />
                                  </div>

                                  {/* 2️⃣ BADGE */}
                                  <div className="basis-[10%] flex items-center justify-center">
                                    <Badge
                                      className={`${getStatusColor2(order.status)} text-white`}
                                      variant="secondary"
                                      text-white
                                    >
                                      {getStatusLabel2(
                                        order.status,
                                      )}
                                    </Badge>
                                  </div>

                                  {/* 3️⃣ PRICE */}
                                  <div className="basis-[10%] flex items-center justify-center font-semibold">
                                    {formatNumber(order.price)}{" "}
                                    ₫
                                  </div>

                                  {/* 4️⃣ ACTIONS */}
                                  <div className="basis-[10%] flex items-center justify-center gap-2">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() =>
                                        handleViewOrder(order)
                                      }
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {(userPermission ==
                                      "admin" ||
                                      (order.status !=
                                        "cancelled" &&
                                        order.status !=
                                          "pending" &&
                                        order.status !=
                                          "delivered") ||
                                      (order.status ==
                                        "pending" &&
                                        (userPermission ==
                                          "sanxuat" ||
                                          userPermission ==
                                            "pic_sx")) ||
                                      (order.status ==
                                        "delivered" &&
                                        userPermission ==
                                          "sale" &&
                                        isCurrentDate(
                                          order.deliveryDate,
                                        ))) && (
                                      <>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() =>
                                            handleEditOrder(
                                              order,
                                            )
                                          }
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                    {userPermission ==
                                      "admin" && (
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() =>
                                          handleDeleteOrder(
                                            order,
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <OrderForm
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedOrder(null);
          }}
          onSave={handleSaveOrder}
          order={selectedOrder}
          saving={savingOrder}
          currentUserId={currentUser?.username || ""}
          userSales={userSales}
          userSanxuat={userSanxuat}
        />

        {/* Dialogs */}
        <OrderAvailableForm
          open={isFormAvailableOpen}
          onClose={() => {
            setFormAvailableOpen(false);
            setSelectedOrder(null);
          }}
          onSave={handleSaveOrder}
          order={selectedOrder}
          saving={savingOrder}
          currentUserId={currentUser?.username || ""}
          userSanxuat={userSanxuat}
          userSales={userSales}
          permission={userPermission}
        />

        <OrderDetailsDialog
          open={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          userSales={userSales}
          userSanxuat={userSanxuat}
        />

        <OrderAvailableDetail
          open={isOrderAvailableDetailOpen}
          onClose={() => {
            setIsOrderAvailableDetailOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          userSales={userSales}
          userSanxuat={userSanxuat}
        />

        <AlertDialog
          open={!!orderToDelete}
          onOpenChange={() => setOrderToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa đơn</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa đơn{" "}
                {orderToDelete?.id.slice(0, 8)} không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bỏ</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!orderToChangeStatus}
          onOpenChange={() => setOrderToChangeStatus(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Thay đổi trạng thái đơn
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cập nhật trạng thái cho đơn{" "}
                <span className="font-mono">
                  {orderToChangeStatus?.id.slice(0, 8)}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Select
                value={newStatus}
                onValueChange={(value) =>
                  setNewStatus(value as Order["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userPermission === "sale" ||
                  userPermission === "pic_sale" ? (
                    <>
                      {orderToChangeStatus?.status ===
                        "pending" && (
                        <SelectItem
                          key="pending"
                          value="pending"
                        >
                          Chờ xử lí
                        </SelectItem>
                      )}
                      {((orderToChangeStatus?.nguoiGiao ===
                        currentUser.username &&
                        userPermission === "sale") ||
                        userPermission === "pic_sale") && (
                        <SelectItem
                          key="delivered"
                          value="delivered"
                        >
                          Đã giao khách
                        </SelectItem>
                      )}
                    </>
                  ) : userPermission === "sanxuat" ||
                    userPermission === "pic_sx" ? (
                    <>
                      <SelectItem key="pending" value="pending">
                        Chờ xử lí
                      </SelectItem>
                      <SelectItem
                        key="in-progress"
                        value="in-progress"
                      >
                        Đang xử lí
                      </SelectItem>
                      <SelectItem
                        key="completed"
                        value="completed"
                      >
                        Hoàn thành
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem key="pending" value="pending">
                        Chờ xử lí
                      </SelectItem>
                      <SelectItem
                        key="in-progress"
                        value="in-progress"
                      >
                        Đang xử lí
                      </SelectItem>
                      <SelectItem
                        key="completed"
                        value="completed"
                      >
                        Hoàn thành
                      </SelectItem>
                      <SelectItem
                        key="delivered"
                        value="delivered"
                      >
                        Đã giao khách
                      </SelectItem>
                      <SelectItem
                        key="cancelled"
                        value="cancelled"
                      >
                        Đã hủy
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {newStatus === "delivered" && (
                <div className="space-y-4">
                  <p></p>
                  {/* Checkbox đã thanh toán */}
                  <div className="flex items-center gap-2">
                    <input
                      id="paid-full"
                      type="checkbox"
                      checked={isPaidFull}
                      onChange={(e) =>
                        setIsPaidFull(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    <label
                      htmlFor="paid-full"
                      className={`text-sm font-medium ${
                        isPaidFull
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      Xác nhận khách đã thanh toán hết
                    </label>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Tiền ship:
                    </label>
                    <Input
                      id="ship"
                      type="text"
                      placeholder="Nhập tiền ship"
                      min="0"
                      step="0.01"
                      value={formatNumber(shipDisplay) || ""}
                      onChange={(e) =>
                        handleShipChange(e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="photos">
                      Ảnh chụp thanh toán
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isProcessingImages}
                        onChange={(e) => {
                          const fileArrayfiles = e.target.files;
                          if (fileArrayfiles) {
                            const fileArray =
                              Array.from(fileArrayfiles);
                            // Convert images to base64
                            setIsProcessingImages(true);
                            Promise.all(
                              fileArray.map((file) => file),
                            )
                              .then((urls) => {
                                const existingPhotos =
                                  paymentImages || [];
                                setPaymentImages((prev) => [
                                  ...(prev || []),
                                  ...urls,
                                ]);
                                setIsProcessingImages(false);
                              })
                              .catch((error) => {
                                console.error(
                                  "Error processing images:",
                                  error,
                                );
                                setIsProcessingImages(false);
                              });
                          }
                          // Reset the input
                          e.target.value = "";
                        }}
                      />
                      {isProcessingImages ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </div>
                    {isProcessingImages && (
                      <p className="text-sm text-muted-foreground">
                        Đang xử lý ảnh...
                      </p>
                    )}
                    {paymentImages &&
                      paymentImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {paymentImages.map((blob, index) => {
                            const url =
                              URL.createObjectURL(blob);

                            return (
                              <div
                                key={index}
                                className="relative group"
                              >
                                <img
                                  src={url}
                                  loading="lazy"
                                  alt={`Image ${index + 1}`}
                                  className="h-20 w-full object-cover rounded border"
                                  onLoad={() =>
                                    URL.revokeObjectURL(url)
                                  }
                                />

                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setPaymentImages((prev) =>
                                      prev.filter(
                                        (_, i) => i !== index,
                                      ),
                                    );
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Bỏ</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusChange}>
                Cập nhật
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Change password */}
        <AlertDialog
          open={openChangePassword}
          onOpenChange={setOpenChangePassword}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Thay đổi mật khẩu
              </AlertDialogTitle>
            </AlertDialogHeader>

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <Input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel disabled={loadingChangedPass}>
                Bỏ
              </AlertDialogCancel>

              <Button
                onClick={handleUpdatePassword}
                disabled={loadingChangedPass}
              >
                {loadingChangedPass
                  ? "Đang cập nhật..."
                  : "Cập nhật"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Change Nguoi Lam Confirmation Dialog */}
        <AlertDialog
          open={!!orderToChangeNguoiLam}
          onOpenChange={() => setOrderToChangeNguoiLam(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Thay đổi người làm
              </AlertDialogTitle>
              <AlertDialogDescription>
                Chuyển đơn mã{" "}
                <span className="font-mono">
                  {orderToChangeNguoiLam?.id.slice(0, 8)}
                </span>{" "}
                cho{" "}
                <strong>{getNameNguoiLam(newNguoiLam)}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmNguoiLamChange}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Change Nguoi Giao Confirmation Dialog */}
        <AlertDialog
          open={!!orderToChangeNguoiGiao}
          onOpenChange={() => setOrderToChangeNguoiGiao(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Thay đổi người giao hàng
              </AlertDialogTitle>
              <AlertDialogDescription>
                Chuyển đơn{" "}
                <span className="font-mono">
                  {orderToChangeNguoiGiao?.id.slice(0, 8)}
                </span>{" "}
                cho{" "}
                <strong>
                  {getNameNguoiGiao(newNguoiGiao)}
                </strong>{" "}
                {" giao hàng"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmNguoiGiaoChange}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Login Success Dialog */}
        <AlertDialog
          open={showLoginSuccess}
          onOpenChange={setShowLoginSuccess}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100">
                  <CircleCheck className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-center">
                Đăng nhập thành công
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center"></AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction
                onClick={() => {
                  setShowLoginSuccess(false);
                  setOpenChangePassword(
                    userPermission === "admin" ||
                      currentUser.changed
                      ? false
                      : true,
                  );
                }}
              >
                Tiếp tục
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog for Order Operations */}
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CircleCheck className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-lg md:text-xl">
                {successMessage.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm md:text-base">
                {successMessage.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction
                onClick={() => setShowSuccessDialog(false)}
                className="w-full sm:w-auto"
              >
                Tiếp tục
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* preview image Dialog */}
        <Dialog
          open={!!previewImage}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="max-w-4xl bg-transparent border-0 shadow-none">
            <img
              src={previewImage ?? ""}
              alt="Preview"
              className="max-h-[80vh] w-full object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>

        {/* Error Dialog for Order Operations */}
        <AlertDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <X className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-lg md:text-xl">
                {errorMessage.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm md:text-base">
                {errorMessage.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction
                onClick={() => setShowErrorDialog(false)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                Thử lại
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </>
  );
}