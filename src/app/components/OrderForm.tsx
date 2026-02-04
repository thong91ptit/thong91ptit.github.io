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
import { X, Upload, Loader } from "lucide-react";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderSource: string;
  cakeType: string;
  cakeSize: string;
  creamType: string;
  deliveryAddress: string;
  price: number;
  deposit: number;
  deliveryDate: string;
  deliveryTime: string;
  orderDate: string;
  status:
    | "pending"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "delivered";
  notes: string;
  photos: string[];
  createdBy: string;
  nguoiLam?: string;
  paymentFull?: boolean;
  nguoiGiao?: string;
  ship?: number;
  phukien?: string;
  noidung?: string;
  giaohangNotes?: string;
  orderType?: string;
  userLastUpdated?: string;
}

export interface UserSys {
  id: string;
  fullname: string;
}

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: Order, files: File[]) => void;
  order?: Order | null;
  saving?: boolean;
  currentUserId: string;
  userSales: UserSys[];
  userSanxuat: UserSys[];
}

export function OrderForm({
  open,
  onClose,
  onSave,
  order,
  saving = false,
  currentUserId,
  userSales,
  userSanxuat,
}: OrderFormProps) {
  const [formData, setFormData] = useState<Partial<Order>>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    orderSource: "page",
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
    orderType: "cake-order",
    userLastUpdated: "",
  });

  // Display values for formatted price and deposit
  const [priceDisplay, setPriceDisplay] = useState("");
  const [depositDisplay, setDepositDisplay] = useState("");
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
  const handlePriceChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly === "") {
      setPriceDisplay("");
      return;
    }
    const price = Number(digitsOnly);
    const depositPricedigitsOnly = depositDisplay.replace(
      /\./g,
      "",
    );
    const depositPrice = Number(depositPricedigitsOnly);
    if (
      digitsOnly.length >= depositPricedigitsOnly.length &&
      depositPrice > 0 &&
      price > 0 &&
      depositPrice > price
    ) {
      setPriceDisplay("");
      return;
    }
    // Format the number with dots
    const formatted = formatNumber(digitsOnly);
    setPriceDisplay(formatted);
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
    const user1 = userSales.find((u) => u.id === createdBy);
    if (user1) {
      return user1.fullname;
    }
    const user2 = userSanxuat.find((u) => u.id === createdBy);
    if (user2) {
      return user2.fullname;
    }
    return createdBy;
  };

  // Handle deposit input change with formatting
  const handleDepositChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly === "") {
      setDepositDisplay("");
      return;
    }

    const depositPrice = Number(digitsOnly);
    const pricedigitsOnly = priceDisplay.replace(/\./g, "");
    const price = Number(pricedigitsOnly);

    if (
      digitsOnly.length >= pricedigitsOnly.length &&
      depositPrice > 0 &&
      price > 0 &&
      depositPrice > price
    ) {
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
      });
      setPriceDisplay(formatNumber(order.price));
      setDepositDisplay(formatNumber(order.deposit));
      setPaymentImages([]);
    } else {
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        orderSource: "page",
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
        orderType: "cake-order",
        userLastUpdated: "",
      });
      setPriceDisplay("");
      setDepositDisplay("");
      setPaymentImages([]);
    }
  }, [order, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceOrder = parseFormattedNumber(priceDisplay) || 0;
    const depositOrder =
      parseFormattedNumber(depositDisplay) || 0;
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
      orderSource: formData.orderSource || "phone",
      cakeType: formData.cakeType || "",
      cakeSize: formData.cakeSize || "medium",
      creamType: formData.creamType || "kem-thuong",
      deliveryAddress: formData.deliveryAddress || "",
      price: priceOrder,
      deposit: depositOrder,
      deliveryDate: formData.deliveryDate || "",
      deliveryTime: formData.deliveryTime || "",
      status: formData.status || "pending",
      notes: formData.notes || "",
      photos: formData.photos || [],
      createdBy: formData.createdBy || currentUserId,
      nguoiLam: formData.nguoiLam || "",
      paymentFull: priceOrder === depositOrder,
      nguoiGiao: formData.nguoiGiao || "",
      ship: formData.ship || 0,
      phukien: formData.phukien || "",
      noidung: formData.noidung || "",
      giaohangNotes: formData.giaohangNotes || "",
      orderType: "cake-order",
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
            {order ? "Sửa đơn" : "Tạo Đơn"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customerName">
                Tên khách hàng *
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  handleChange("customerName", e.target.value)
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerPhone">
                  Số điện thoại *
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
                  required
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
              <Label htmlFor="orderSource">Nguồn khách *</Label>
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
                  <SelectItem value="page">
                    {getSourceLabel("page")}
                  </SelectItem>
                  <SelectItem value="shoppee">
                    {getSourceLabel("shoppee")}
                  </SelectItem>
                  <SelectItem value="ticktok">
                    {getSourceLabel("ticktok")}
                  </SelectItem>
                  <SelectItem value="fb_vanphu">
                    {getSourceLabel("fb_vanphu")}
                  </SelectItem>
                  <SelectItem value="fb_vankhe">
                    {getSourceLabel("fb_vankhe")}
                  </SelectItem>
                  <SelectItem value="zalo-chi-diem">
                    {getSourceLabel("zalo-chi-diem")}
                  </SelectItem>
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
              <Label htmlFor="createdBy">Người tạo</Label>
              <Input
                id="createdBy"
                value={getCreatedByLabel(
                  order?.createdBy || currentUserId,
                )}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deliveryAddress">
                Địa chỉ nhận hàng *
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
                required
              />
            </div>

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
                  <SelectItem value="banh-an-vat">
                    {getCakeTypeLabel("banh-an-vat")}
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
                      Kem thường
                    </SelectItem>
                    <SelectItem value="kem-whip">
                      Kem whip
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá *</Label>
                <Input
                  id="price"
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

              <div className="grid gap-2">
                <Label htmlFor="deposit">Tiền Cọc *</Label>
                <Input
                  id="deposit"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deliveryDate">
                  Ngày nhận *
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    handleChange("deliveryDate", e.target.value)
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deliveryTime">
                  Thời gian nhận *
                </Label>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={formData.deliveryTime}
                  onChange={(e) =>
                    handleChange("deliveryTime", e.target.value)
                  }
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="noidung">Nội dung ghi bánh</Label>
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