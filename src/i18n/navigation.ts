import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Dùng CÁC hàm này thay cho "next/link" và "next/navigation" ở mọi nơi
// trong app/ và components/ — chúng tự thêm/giữ tiền tố locale hiện tại
// vào href (vd Link href="/characters" trên trang "/vi/..." tự render ra
// "/vi/characters"), tránh phải nối chuỗi `/${locale}/...` thủ công ở
// hàng chục nơi.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
