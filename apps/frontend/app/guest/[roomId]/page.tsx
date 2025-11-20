import { GuestCanvas } from "@/components/GuestCanvas";

export default function GuestPage({ params }: { params: { roomId: string } }) {
  return <GuestCanvas roomId={params.roomId} />;
}
