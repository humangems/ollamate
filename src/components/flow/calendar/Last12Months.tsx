import _ from "lodash";
import { MoonIcon, MoonStarIcon, SunDimIcon, SunIcon, SunMoonIcon } from "lucide-react";

export default function Last12Months() {
  const days = 31;
  const slots = 4;

  const icons = [
    <MoonStarIcon size={14} className="text-purple-11" />,
    <SunDimIcon size={14} className="text-amber-11" />,
    <SunIcon size={14} className="text-amber-11" />,
    <MoonIcon size={14} className="text-purple-11" />,
  ];


  return (
    <div className="">
      <div>
        <div className="flex items-center gap-1">
          <div className="size-4"></div>
          {Array.from({ length: days }).map((_, day) => (
            <div className="size-4 text-center whitespace-nowrap overflow-hidden text-1">
              {day + 1}
            </div>
          ))}
        </div>

        {Array.from({ length: slots }).map((_, slot) => (
          <div className="flex items-center gap-1 mt-1">
            <div className="size-">{icons[slot]}</div>
            {Array.from({ length: days }).map((_, day) => (
              <div className="size-4 rounded-1 bg-gray-6"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}