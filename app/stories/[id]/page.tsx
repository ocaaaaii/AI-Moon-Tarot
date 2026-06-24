import { notFound } from "next/navigation";

import StoryViewer from "@/components/stories/StoryViewer";
import { getStory, getParentSeriesId } from "@/lib/stories/stories";

export default function StoryPage({ params }: { params: { id: string } }) {
  const story = getStory(params.id);
  if (!story) notFound();

  const seriesId = getParentSeriesId(params.id);
  const backHref = seriesId ? `/stories/${seriesId}` : "/stories";

  return <StoryViewer story={story} backHref={backHref} />;
}
