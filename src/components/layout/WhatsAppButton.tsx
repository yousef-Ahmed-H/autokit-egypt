import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/site";

/** زر واتساب العائم — يظهر في كل الصفحات */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 end-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      aria-label="تواصل عبر واتساب (رقم تجريبي)"
    >
      <WhatsAppIcon />
      <span className="sr-only">واتساب</span>
    </a>
  );
}
