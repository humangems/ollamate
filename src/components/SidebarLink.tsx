import clsx from "clsx";
import { SquarePenIcon } from "lucide-react";
import { Link } from "react-router-dom";

type SidebarLinkProps = {
  icon: typeof SquarePenIcon;
  text: string;
  href: string;
  active?: boolean;
};

export default function SidebarLink({icon, text, active=false, href}: SidebarLinkProps) {
  const Icon = icon;
  return (
    <Link to={href}>
      <div className={clsx("flex items-center space-x-1 cursor-default h-8 px-2 rounded-1", active && 'bg-gray-5')}>
        <div className="flex items-center justify-center text-gray-12">
          <Icon size="14" strokeWidth={1.5} />
        </div>
        <div className="text-2">{text}</div>
      </div>
    </Link>
  );
}