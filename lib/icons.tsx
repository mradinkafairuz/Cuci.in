"use client";

import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { Icon, IconProps, IconWeight } from "@phosphor-icons/react";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { BankIcon } from "@phosphor-icons/react/dist/csr/Bank";
import { BasketIcon } from "@phosphor-icons/react/dist/csr/Basket";
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen";
import { CalendarDotsIcon } from "@phosphor-icons/react/dist/csr/CalendarDots";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/csr/CircleNotch";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { CrownIcon } from "@phosphor-icons/react/dist/csr/Crown";
import { CurrencyCircleDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyCircleDollar";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { DropIcon } from "@phosphor-icons/react/dist/csr/Drop";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { HandbagIcon } from "@phosphor-icons/react/dist/csr/Handbag";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MagnifyingGlassMinusIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlassMinus";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { NavigationArrowIcon } from "@phosphor-icons/react/dist/csr/NavigationArrow";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { RowsIcon } from "@phosphor-icons/react/dist/csr/Rows";
import { ScalesIcon } from "@phosphor-icons/react/dist/csr/Scales";
import { SealCheckIcon } from "@phosphor-icons/react/dist/csr/SealCheck";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SprayBottleIcon } from "@phosphor-icons/react/dist/csr/SprayBottle";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { TShirtIcon } from "@phosphor-icons/react/dist/csr/TShirt";
import { TruckIcon } from "@phosphor-icons/react/dist/csr/Truck";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { WashingMachineIcon } from "@phosphor-icons/react/dist/csr/WashingMachine";
import { WindIcon } from "@phosphor-icons/react/dist/csr/Wind";
import { WrenchIcon } from "@phosphor-icons/react/dist/csr/Wrench";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type CompatibleIconProps = IconProps & { strokeWidth?: number };
type CompatibleIcon = ForwardRefExoticComponent<
  CompatibleIconProps & RefAttributes<SVGSVGElement>
>;

function adaptIcon(Source: Icon): CompatibleIcon {
  return forwardRef<SVGSVGElement, CompatibleIconProps>(function PhosphorIcon(
    { strokeWidth, weight, ...props },
    ref,
  ) {
    const phosphorWeight: IconWeight =
      weight ?? (strokeWidth !== undefined && strokeWidth >= 2 ? "bold" : "regular");
    return <Source {...props} ref={ref} weight={phosphorWeight} />;
  });
}

// Keep the existing names as aliases while the visual language moves to Phosphor.
export const ArrowLeft = adaptIcon(ArrowLeftIcon);
export const ArrowRight = adaptIcon(ArrowRightIcon);
export const ArrowUpRight = adaptIcon(ArrowUpRightIcon);
export const ArrowsClockwise = adaptIcon(ArrowsClockwiseIcon);
export const Banknote = adaptIcon(BankIcon);
export const BadgeCheck = adaptIcon(SealCheckIcon);
export const BadgeDollarSign = adaptIcon(CurrencyCircleDollarIcon);
export const BookOpen = adaptIcon(BookOpenIcon);
export const CalendarDays = adaptIcon(CalendarDotsIcon);
export const Check = adaptIcon(CheckIcon);
export const CheckCircle2 = adaptIcon(CheckCircleIcon);
export const ChevronDown = adaptIcon(CaretDownIcon);
export const Clock = adaptIcon(ClockIcon);
export const Clock3 = adaptIcon(ClockIcon);
export const ClipboardList = adaptIcon(ClipboardTextIcon);
export const ContactRound = adaptIcon(AddressBookIcon);
export const Crown = adaptIcon(CrownIcon);
export const Droplets = adaptIcon(DropIcon);
export const Eye = adaptIcon(EyeIcon);
export const EyeOff = adaptIcon(EyeSlashIcon);
export const Hash = adaptIcon(HashIcon);
export const House = adaptIcon(HouseIcon);
export const LayoutDashboard = adaptIcon(SquaresFourIcon);
export const Loader2 = adaptIcon(CircleNotchIcon);
export const LoaderCircle = adaptIcon(CircleNotchIcon);
export const LockKeyhole = adaptIcon(LockKeyIcon);
export const LogOut = adaptIcon(SignOutIcon);
export const Mail = adaptIcon(EnvelopeIcon);
export const MapPin = adaptIcon(MapPinIcon);
export const MoreHorizontal = adaptIcon(DotsThreeIcon);
export const Navigation = adaptIcon(NavigationArrowIcon);
export const PackageCheck = adaptIcon(PackageIcon);
export const PackageOpen = adaptIcon(PackageIcon);
export const PackageSearch = adaptIcon(MagnifyingGlassIcon);
export const Pause = adaptIcon(PauseIcon);
export const Phone = adaptIcon(PhoneIcon);
export const Play = adaptIcon(PlayIcon);
export const Plus = adaptIcon(PlusIcon);
export const RefreshCw = adaptIcon(ArrowsClockwiseIcon);
export const Rows3 = adaptIcon(RowsIcon);
export const Save = adaptIcon(FloppyDiskIcon);
export const Scale = adaptIcon(ScalesIcon);
export const Search = adaptIcon(MagnifyingGlassIcon);
export const SearchX = adaptIcon(MagnifyingGlassMinusIcon);
export const Shirt = adaptIcon(TShirtIcon);
export const ShieldCheck = adaptIcon(ShieldCheckIcon);
export const ShoppingBag = adaptIcon(HandbagIcon);
export const ShoppingBasket = adaptIcon(BasketIcon);
export const Sparkles = adaptIcon(SparkleIcon);
export const SprayCan = adaptIcon(SprayBottleIcon);
export const Truck = adaptIcon(TruckIcon);
export const Users = adaptIcon(UsersIcon);
export const WashingMachine = adaptIcon(WashingMachineIcon);
export const Wind = adaptIcon(WindIcon);
export const Wrench = adaptIcon(WrenchIcon);
export const X = adaptIcon(XIcon);
export const Zap = adaptIcon(LightningIcon);

export type PhosphorIcon = CompatibleIcon;
