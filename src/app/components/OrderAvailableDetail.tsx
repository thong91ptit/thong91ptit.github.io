import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Order, UserSys } from "./OrderForm";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { ReadOnlySmartTextarea } from "./ReadOnlySmartTextarea";
import {
  Cake,
  Phone,
  Mail,
  DollarSign,
  Package,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MapPin,
  Store,
  Calendar,
  Clock,
  User,
} from "lucide-react";

interface OrderAvailableDetailProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  userSales: UserSys[];
  userSanxuat: UserSys[];
}

export function OrderAvailableDetail({
  open,
  onClose,
  order,
  userSales,
  userSanxuat,
}: OrderAvailableDetailProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (!order) return null;

  const getStatusColor = (status: Order["status"]) => {
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

  const formatPrice = (amount: number) => {
    // Format number with dots as thousand separators
    return amount
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
      case "zalo-chi-diem":
        return "Zalo Chị Diễm";
      default:
        return orderSource;
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

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setZoom(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
  };

  const nextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % order.photos!.length,
    );
    setZoom(1);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + order.photos!.length) %
        order.photos!.length,
    );
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground">Mã đơn</p>
              <p className="font-mono">
                {order.id.slice(0, 8)}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel2(order.status).toUpperCase()}
            </Badge>
          </div>

          <div>
            <h3 className="mb-3">Thông tin khách hàng</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Tên khách hàng:
                </span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customerEmail}</span>
                </div>
              )}
              {order.deliveryAddress.length > 0 && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3">Thông tin đơn</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-muted-foreground" />
                <span>
                  {getOrderSourceLabel(
                    order.orderSource || "page",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4 text-muted-foreground" />
                <span>{getCakeTypeLabel(order.cakeType)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">
                  {order.cakeSize} -{" "}
                  {order.creamType === "kem-thuong"
                    ? "Kem thuong"
                    : "Kem whip"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-red">
                  Giá niêm yết: {formatPrice(order.price || 0)}{" "}
                  ₫{" "}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-black font-bold">
                  Giá bán thực tế:{" "}
                  {order.status == "pending" ||
                  order.status == "completed"
                    ? formatPrice(order.price || 0)
                    : formatPrice(order.deposit || 0)}{" "}
                  ₫{" "}
                </span>
              </div>
              {order.ship > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Phí ship:
                  </span>
                  <span>{formatPrice(order.ship) || "0"}</span>
                </div>
              )}
            </div>
          </div>

          {order.photos && order.photos.length > 0 && (
            <>
              <div>
                <h3 className="mb-3">Ảnh</h3>
                <div className="grid grid-cols-3 gap-3">
                  {order.photos.map((photo, index) => (
                    <a
                      key={index}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                      onClick={(e) => {
                        e.preventDefault();
                        openLightbox(index);
                      }}
                    >
                      <img
                        src={photo}
                        loading="lazy"
                        alt={`Cake ${index + 1}`}
                        className="w-full h-32 object-cover rounded border hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {order.phukien && (
            <>
              <h3 className="mb-2">Phụ kiện</h3>
              <div
                className="
        whitespace-pre-wrap
        break-words
        rounded-md
        border
        bg-muted
        p-3
        text-sm
        select-text
      "
              >
                {order.phukien}
              </div>
            </>
          )}
          {order.noidung && (
            <>
              <h3 className="mb-2">Nội dung ghi bánh</h3>
              <div
                className="
        whitespace-pre-wrap
        break-words
        rounded-md
        border
        bg-muted
        p-3
        text-sm
        select-text
      "
              >
                {order.noidung}
              </div>
            </>
          )}
          {order.notes && (
            <>
              <h3 className="mb-2">Mô tả</h3>
              <div
                className="
        whitespace-pre-wrap
        break-words
        rounded-md
        border
        bg-muted
        p-3
        text-sm
        select-text
      "
              >
                {order.notes}
              </div>
            </>
          )}
        </div>

        <div>
          <h3 className="mb-3">Thời gian</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">
                Thời gian tạo
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(order.orderDate)}</span>
              </div>
            </div>
            {order.deliveryDate != "" && (
              <div>
                <p className="text-muted-foreground">
                  Thời gian bán
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(order.deliveryDate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Người tạo:
            </span>
            <span>
              {getCreatedByLabel(order.createdBy) || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Người làm:
            </span>
            <span>
              {getNameNguoiLam(order.nguoiLam) || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Người bán hàng:
            </span>
            <span>
              {getNameNguoiGiao(order.nguoiGiao) || "N/A"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Lightbox */}
      {lightboxOpen &&
        order.photos &&
        order.photos.length > 0 && (
          <Dialog
            open={lightboxOpen}
            onOpenChange={closeLightbox}
          >
            <DialogContent className="max-w-5xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>
                    Photo Viewer ({currentImageIndex + 1} of{" "}
                    {order.photos.length})
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetZoom}
                      disabled={zoom === 1}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="relative overflow-auto max-h-[60vh] flex items-center justify-center bg-muted/20 rounded">
                <img
                  src={order.photos[currentImageIndex]}
                  alt={`Cake ${currentImageIndex + 1}`}
                  className="max-w-full transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>

              {order.photos.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button variant="outline" onClick={prevImage}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentImageIndex + 1} /{" "}
                    {order.photos.length}
                  </span>
                  <Button variant="outline" onClick={nextImage}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
    </Dialog>
  );
}