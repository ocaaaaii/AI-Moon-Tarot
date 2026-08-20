import { notFound } from "next/navigation";

import { getOmikujiAvatar, OMIKUJI_AVATARS } from "@/lib/omikuji/avatars";
import { getCompanionMeta } from "@/lib/garden/companionPersonas";
import GardenCompanionChat from "@/components/ui/GardenCompanionChat";

export default function CompanionChatPage({ params }: { params: { personaId: string } }) {
  const meta = getCompanionMeta(params.personaId);
  if (!meta || !OMIKUJI_AVATARS.some((a) => a.id === params.personaId)) notFound();

  const avatar = getOmikujiAvatar(params.personaId);

  return <GardenCompanionChat avatar={avatar} meta={meta} />;
}
