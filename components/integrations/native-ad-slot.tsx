import { nativeAd } from "@/config/adsterra";
import { NativeAdClient } from "./native-ad-client";

export function NativeAdSlot() {
  return (
    <aside className="ad-slot ad-native" aria-label="Advertisement" data-ad-native>
      <span className="ad-label">Advertisement</span>
      <NativeAdClient {...nativeAd} />
    </aside>
  );
}
