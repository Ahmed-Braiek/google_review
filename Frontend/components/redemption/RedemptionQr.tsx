"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function RedemptionQr({ value, code }: { value: string; code: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 260,
      color: { dark: "#111111", light: "#f8f1e5" },
    }).then((url) => { if (active) setSrc(url); });
    return () => { active = false; };
  }, [value]);

  return (
    <div className="redemption-qr" data-tutorial-target="qr" aria-label="Secure staff validation QR code">
      {src ? <img src={src} alt="Secure staff validation QR code" /> : <span className="redemption-qr__placeholder" />}
      <strong>{code}</strong>
    </div>
  );
}
