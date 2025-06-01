import { RoomCanvas } from "../../../components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  return <RoomCanvas slug={slug} />;
}
