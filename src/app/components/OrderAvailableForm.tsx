import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Order, UserSys } from "./OrderForm";
import { X, Upload, Loader } from "lucide-react";

interface OrderAvailableFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: Order, files: File[]) => void;
  order?: Order | null;
  saving?: boolean;
  currentUserId: string;
  userSanxuat: UserSys[];
  userSales: UserSys[];
  permission: string;
}

export function OrderAvailableForm({
  open,
  onClose,
  onSave,
  order,
  saving = false,
  currentUserId,
  userSanxuat,
  userSales,
  permission,
}: OrderAvailableFormProps) {
  const [formData, setFormData] = useState<Partial<Order>>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    orderSource: "in-shop-vanphu",
    cakeType: "banh-sinh-nhat",
    cakeSize: "",
    creamType: "kem-thuong",
    deliveryAddress: "",
    price: 0,
    deposit: 0,
    deliveryDate: "",
    deliveryTime: "",
    status: "pending",
    notes: "",
    photos: [],
    createdBy: "",
    nguoiLam: "",
    paymentFull: false,
    nguoiGiao: "",
    ship: 0,
    phukien: "",
    noidung: "",
    giaohangNotes: "",
    orderType: "cake-available",
    userLastUpdated: "",
  });

  // Display values for formatted price and deposit
  const [priceDisplay, setPriceDisplay] = useState("");
  const [depositDisplay, setDepositDisplay] = useState("");
  const [shipDisplay, setShipDisplay] = useState("");
  const [isProcessingImages, setIsProcessingImages] =
    useState(false);
  const [paymentImages, setPaymentImages] = useState<File[]>(
    [],
  );

  // Format number with dots as thousand separators
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

  // Parse formatted string back to number
  const parseFormattedNumber = (value: string): number => {
    const cleanValue = value.replace(/\./g, "");
    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? 0 : numValue;
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

  // Handle price input change with formatting
  const handlePriceChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly === "") {
      setPriceDisplay("");
      return;
    }
    // Format the number with dots
    const formatted = formatNumber(digitsOnly);
    setPriceDisplay(formatted);
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

  const getCakeTypeLabel = (cakeType: string) => {
    switch (cakeType) {
      case "banh-sinh-nhat":
        return "Bánh sinh nhật";
      case "tiramisu":
        return "Tiramisu";
      case "bltm":
        return "BLTM";
      case "banh-tet":
        return "Bánh tết";
      case "banh-sinh-nhat-san":
        return "Bánh sinh nhật sẵn";
      case "cup-cake":
        return "Cup cake";
      case "banh-an-vat":
        return "Bánh Ăn Vặt";
      default:
        return cakeType;
    }
  };

  const getStatusColorstatusTextColor: Record<string, string> =
    {
      pending: "text-yellow-600",
      completed: "text-green-600",
      delivered: "text-blue-600",
      cancelled: "text-red-600",
    };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case "page":
        return "Page";
      case "shoppee":
        return "Shoppee";
      case "ticktok":
        return "Tiktok";
      case "fb_vanphu":
        return "FB Văn Phú";
      case "fb_vankhe":
        return "FB Văn Khê";
      case "in-shop-vanphu":
        return "Cửa hàng văn phú";
      case "in-shop-vankhe":
        return "Cửa hàng văn khê";
      case "zalo-chi-diem":
        return "Zalo Chị Diễm";
      default:
        return sourceType;
    }
  };

  const getCreatedByLabel = (createdBy: string) => {
    switch (createdBy) {
      case "dung":
        return "Dung";
      case "lananh":
        return "Lan Anh";
      case "van":
        return "Vân";
      case "thuyduong":
        return "Thùy Dương";
      case "quynh":
        return "Quỳnh";
      case "hue":
        return "Huế";
      case "long":
        return "Long";
      case "vanthai":
        return "Văn Thái";
      case "khanh":
        return "Khánh";
      case "phuonganh":
        return "Phương Anh";
      case "anhthu":
        return "Anh Thư";
      case "thu":
        return "Thư";
      case "hoang":
        return "Hoàng";
      case "duy":
        return "Duy";
      case "huyen":
        return "Huyền";
      case "thuy":
        return "Thúy";
      default:
        return createdBy;
    }
  };

  // Handle deposit input change with formatting
  const handleDepositChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly === "") {
      setDepositDisplay("");
      return;
    }
    // Format the number with dots
    const formatted = formatNumber(digitsOnly);
    setDepositDisplay(formatted);
  };

  useEffect(() => {
    if (order) {
      setFormData({
        ...order,
        customerEmail: order.customerEmail || "",
        orderSource:
          order.orderSource != "in-shop-vankhe" &&
          order.orderSource != "in-shop-vanphu"
            ? "in-shop-vanphu"
            : order.orderSource,
      });
      const deposit =
        order.deposit <= 0 ? order.price : order.deposit;
      if (
        order.status == "delivered" &&
        order.deliveryDate == ""
      ) {
        formData.deliveryDate = new Date().toLocaleDateString(
          "en-CA",
          {
            timeZone: "Asia/Ho_Chi_Minh",
          },
        );
      }
      setPriceDisplay(formatNumber(order.price));
      setDepositDisplay(formatNumber(deposit));
      setShipDisplay(formatNumber(order.ship));
      setPaymentImages([]);
    } else {
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        orderSource: "in-shop-vanphu",
        cakeType: "banh-sinh-nhat",
        cakeSize: "",
        creamType: "kem-thuong",
        deliveryAddress: "",
        price: 0,
        deposit: 0,
        deliveryDate: "",
        deliveryTime: "",
        status: "pending",
        notes: "",
        photos: [],
        createdBy: "",
        nguoiLam: "",
        paymentFull: false,
        nguoiGiao: "",
        ship: 0,
        phukien: "",
        noidung: "",
        giaohangNotes: "",
        orderType: "cake-available",
        userLastUpdated: "",
      });
      setPriceDisplay("");
      setDepositDisplay("");
      setShipDisplay("");
      setPaymentImages([]);
    }
  }, [order, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceOrder = parseFormattedNumber(priceDisplay) || 0;
    const shipFee = parseFormattedNumber(shipDisplay) || 0;
    var depositOrder =
      parseFormattedNumber(depositDisplay) || 0;
    if (formData.status != "delivered") {
      depositOrder = priceOrder;
    }
    const deliveryDate =
      (order &&
        order.status != formData.status &&
        formData.status == "delivered") ||
      (order &&
        order.status == "delivered" &&
        formData.deliveryDate == "")
        ? new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
          })
        : formData.deliveryDate || "";
    var nguoiGiao = formData.nguoiGiao || "";
    if (nguoiGiao == "" && formData.status == "delivered") {
      nguoiGiao = currentUserId;
    }
    const orderData: Order = {
      id: order?.id || crypto.randomUUID(),
      orderDate:
        order?.orderDate ||
        new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      customerName: formData.customerName || "",
      customerPhone: formData.customerPhone || "",
      customerEmail: formData.customerEmail || "",
      orderSource:
        formData.orderSource != "in-shop-vankhe" &&
        formData.orderSource != "in-shop-vanphu"
          ? "in-shop-vanphu"
          : formData.orderSource,
      cakeType: formData.cakeType || "",
      cakeSize: formData.cakeSize || "medium",
      creamType: formData.creamType || "kem-thuong",
      deliveryAddress: formData.deliveryAddress || "",
      price: priceOrder,
      deposit: depositOrder,
      deliveryDate: deliveryDate,
      deliveryTime: formData.deliveryTime || "",
      status: formData.status || "pending",
      notes: formData.notes || "",
      photos: formData.photos || [],
      createdBy: formData.createdBy || currentUserId,
      nguoiLam: formData.nguoiLam || "",
      paymentFull: priceOrder === depositOrder,
      nguoiGiao: nguoiGiao,
      ship: shipFee || 0,
      phukien: formData.phukien || "",
      noidung: formData.noidung || "",
      giaohangNotes: formData.giaohangNotes || "",
      orderType: "cake-available",
      userLastUpdated: currentUserId,
    };
    console.log("formData.price: ", priceOrder);
    console.log("formData.deposit: ", depositOrder);
    console.log(
      "formData.paymentFull: ",
      orderData.paymentFull,
    );
    onSave(orderData, paymentImages);
  };

  const handleChange = (
    field: keyof Partial<Order>,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Resize and compress image
  const resizeAndCompressImage = (
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          // Create canvas and resize
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64 with compression
            const compressedBase64 = canvas.toDataURL(
              "image/jpeg",
              quality,
            );
            resolve(compressedBase64);
          } else {
            reject(new Error("Failed to get canvas context"));
          }
        };
        img.onerror = () =>
          reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () =>
        reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {order
              ? `Sửa Đơn Bánh Sẵn (Mã đơn: ${order.id.slice(0, 8)})`
              : "Tạo Đơn Bánh Sẵn"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {((order && permission === "admin") ||
              permission === "pic_sale" ||
              permission === "sale") && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="customerName">
                    Tên khách hàng
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleChange(
                        "customerName",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerPhone">
                      Số điện thoại
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        handleChange(
                          "customerPhone",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        handleChange(
                          "customerEmail",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deliveryAddress">
                    Địa chỉ nhận hàng
                  </Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="Enter delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      handleChange(
                        "deliveryAddress",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </>
            )}

            {(permission === "admin" ||
              permission === "pic_sx" ||
              permission === "sanxuat") && (
              <div className="grid gap-2">
                <Label htmlFor="createdBy">Người Làm</Label>
                <p>
                  <Select
                    value={formData.nguoiLam || ""}
                    onValueChange={(value) => {
                      handleChange("nguoiLam", value);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="N/A" value="N/A">
                        ...
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
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="orderSource">Kho</Label>
              <Select
                value={formData.orderSource}
                onValueChange={(value) =>
                  handleChange("orderSource", value)
                }
              >
                <SelectTrigger id="orderSource">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-shop-vanphu">
                    {getSourceLabel("in-shop-vanphu")}
                  </SelectItem>
                  <SelectItem value="in-shop-vankhe">
                    {getSourceLabel("in-shop-vankhe")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái bánh*</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleChange("status", value)
                }
                disabled={
                  order &&
                  order.status == "delivered" &&
                  permission != "admin" &&
                  permission != "pic_sale"
                }
              >
                <SelectTrigger
                  id="status"
                  className={getStatusColor(formData.status)}
                >
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {permission != "sale" &&
                    permission != "pic_sale" && (
                      <SelectItem key="pending" value="pending">
                        {getStatusLabel2("pending")}
                      </SelectItem>
                    )}

                  <SelectItem key="completed" value="completed">
                    {getStatusLabel2("completed")}
                  </SelectItem>
                  {permission != "sanxuat" &&
                    permission != "pic_sx" && (
                      <>
                        <SelectItem
                          key="delivered"
                          value="delivered"
                        >
                          {getStatusLabel2("delivered")}
                        </SelectItem>
                        <SelectItem
                          key="cancelled"
                          value="cancelled"
                        >
                          {getStatusLabel2("cancelled")}
                        </SelectItem>
                      </>
                    )}
                </SelectContent>
              </Select>
            </div>

            {(permission === "sanxuat" ||
              permission === "pic_sx" ||
              permission === "admin") && (
              <div className="grid gap-2">
                <Label htmlFor="cakeType">Loại Bánh *</Label>
                <Select
                  value={formData.cakeType}
                  onValueChange={(value) =>
                    handleChange("cakeType", value)
                  }
                >
                  <SelectTrigger id="cakeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banh-sinh-nhat">
                      {getCakeTypeLabel("banh-sinh-nhat")}
                    </SelectItem>
                    <SelectItem value="banh-tet">
                      {getCakeTypeLabel("banh-tet")}
                    </SelectItem>
                    <SelectItem value="tiramisu">
                      {getCakeTypeLabel("tiramisu")}
                    </SelectItem>
                    <SelectItem value="bltm">
                      {getCakeTypeLabel("bltm")}
                    </SelectItem>
                    <SelectItem value="cup-cake">
                      {getCakeTypeLabel("cup-cake")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(permission === "sanxuat" ||
              permission === "pic_sx" ||
              permission === "admin") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cakeSize">Size *</Label>
                  <Input
                    id="cakeSize"
                    placeholder="e.g., 20cm, 1kg, Small"
                    value={formData.cakeSize}
                    onChange={(e) =>
                      handleChange("cakeSize", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="creamType">Loại Kem *</Label>
                  <Select
                    value={formData.creamType}
                    onValueChange={(value) =>
                      handleChange("creamType", value)
                    }
                  >
                    <SelectTrigger id="creamType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kem-thuong">
                        Kem thuong
                      </SelectItem>
                      <SelectItem value="kem-whip">
                        Kem whip
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {(permission === "sanxuat" ||
                permission === "pic_sx" ||
                permission === "admin") && (
                <div className="grid gap-2">
                  <Label htmlFor="price-input">Giá bán *</Label>
                  <Input
                    id="price-input"
                    type="text"
                    min="0"
                    step="0.01"
                    value={priceDisplay}
                    onChange={(e) =>
                      handlePriceChange(e.target.value)
                    }
                    required
                  />
                </div>
              )}

              {(permission === "sale" ||
                permission === "pic_sale") && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="deposit-input">
                      Giá bán thực tế *
                    </Label>
                    <Input
                      id="deposit-input"
                      type="text"
                      min="0"
                      step="0.01"
                      value={depositDisplay}
                      onChange={(e) =>
                        handleDepositChange(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Giá niêm yết</Label>
                    <p className="font-medium text-muted-foreground">
                      {priceDisplay} ₫
                    </p>
                  </div>
                </>
              )}
            </div>
            {order &&
              (permission === "sale" ||
                permission === "pic_sale" ||
                permission === "admin") && (
                <div className="grid gap-2">
                  <Label htmlFor="fee-input">Phí ship</Label>
                  <Input
                    id="price-input"
                    type="text"
                    min="0"
                    step="0.01"
                    value={shipDisplay}
                    onChange={(e) =>
                      handleShipChange(e.target.value)
                    }
                  />
                </div>
              )}

            {order &&
              (permission == "sale" ||
                permission == "pic_sale" ||
                permission == "admin") && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phukien">Phụ kiện</Label>
                    <Textarea
                      id="phukien"
                      placeholder="Nhập phụ kiện..."
                      value={formData.phukien}
                      onChange={(e) =>
                        handleChange("phukien", e.target.value)
                      }
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="noidung">
                      Nội dung ghi bánh
                    </Label>
                    <Textarea
                      id="noidung"
                      placeholder="Nhập nội dung ghi bánh..."
                      value={formData.noidung}
                      onChange={(e) =>
                        handleChange("noidung", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </>
              )}

            {(permission == "sanxuat" ||
              permission == "pic_sx" ||
              permission == "admin") && (
              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  placeholder="Nhập ghi chú..."
                  value={formData.notes}
                  onChange={(e) =>
                    handleChange("notes", e.target.value)
                  }
                  rows={6}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="photos">Ảnh</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isProcessingImages}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      if (files) {
                        const fileArray = Array.from(files);
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
              {formData.photos &&
                formData.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <img
                          src={photo}
                          loading="lazy"
                          alt={`Cake ${index + 1}`}
                          className="h-20 w-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={
                            index == 0 &&
                            (permission == "sale" ||
                              permission == "pic_sale")
                          }
                          onClick={() => {
                            const newPhotos =
                              formData.photos?.filter(
                                (_, i) => i !== index,
                              ) || [];
                            setFormData((prev) => ({
                              ...prev,
                              photos: newPhotos,
                            }));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              {paymentImages && paymentImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {paymentImages.map((blob, index) => {
                    const url = URL.createObjectURL(blob);

                    return (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <img
                          src={url}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Bỏ
            </Button>
            <Button
              type="submit"
              disabled={saving || isProcessingImages}
            >
              {saving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : order ? (
                "Cập nhật"
              ) : (
                "Tạo Đơn"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}