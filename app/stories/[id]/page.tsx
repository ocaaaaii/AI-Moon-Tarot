import { notFound } from "next/navigation";

import StoryViewer from "@/components/stories/StoryViewer";
import { getStory } from "@/lib/stories/stories";

export default function StoryPage({ params }: { params: { id: string } }) {
  const story = getStory(params.id);
  if (!story) notFound();

  return <StoryViewer story={story} />;
}
