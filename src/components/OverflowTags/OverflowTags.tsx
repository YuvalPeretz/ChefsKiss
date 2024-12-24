import { Popover, PopoverProps, Space, Tag, TagProps } from "antd";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import useResponsive from "../../hooks/useResponsive";

export default function OverflowTags({
  tags,
  props: { popover: popoverProps, tag: tagProps, tagsContainer, container } = {},
}: {
  tags: string[];
  props?: {
    container?: { style?: CSSProperties };
    tagsContainer?: { style?: CSSProperties };
    tag?: TagProps;
    popover?: PopoverProps;
  };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [hiddenTags, setHiddenTags] = useState<string[]>([]);
  const { width } = useResponsive();
  const TAG_GAP = "gap" in (tagsContainer?.style || {}) ? Number(tagsContainer?.style?.gap) : 0; // Gap between tags in pixels

  // Initialize refs for each tag during render
  const tagRefs = useRef<React.RefObject<HTMLSpanElement>[]>([]);
  tagRefs.current = tags
    .sort((tagA, tagB) => tagA.length - tagB.length)
    .map((_, i) => tagRefs.current[i] || React.createRef<HTMLSpanElement>());

  // A state to trigger re-measurement after refs are assigned
  const [measureTrigger, setMeasureTrigger] = useState(0);

  useEffect(() => {
    // Wait until refs are assigned
    if (tagRefs.current.every((ref) => ref.current)) {
      measureTags();
    } else {
      // Re-trigger the effect if refs are not yet assigned
      setMeasureTrigger((prev) => prev + 1);
    }
  }, [tags, measureTrigger, width]);

  const measureTags = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    const tempVisibleTags: string[] = [];
    const tempHiddenTags: string[] = [];

    // Measure the widths of all tags
    const tagWidths = tags.map((_, i) => {
      const tagEl = tagRefs.current[i]?.current;
      return tagEl ? tagEl.offsetWidth : 0;
    });

    // Cache for "+N" tag widths
    const moreTagWidthCache: { [key: number]: number } = {};

    // Function to measure "+N" tag width
    const measureMoreTagWidth = (remainingCount: number) => {
      if (moreTagWidthCache[remainingCount]) {
        return moreTagWidthCache[remainingCount];
      }
      const tempTag = document.createElement("span");
      tempTag.className = "ant-tag";
      tempTag.style.visibility = "hidden";
      tempTag.style.position = "absolute";
      tempTag.innerText = `+${remainingCount}`;
      document.body.appendChild(tempTag);
      const width = tempTag.offsetWidth;
      document.body.removeChild(tempTag);
      moreTagWidthCache[remainingCount] = width;
      return width;
    };

    let totalWidth = 0;

    for (let i = 0; i < tags.length; i++) {
      const tagWidth = tagWidths[i];
      const gapBeforeTag = tempVisibleTags.length > 0 ? TAG_GAP : 0;

      totalWidth += gapBeforeTag + tagWidth;

      if (totalWidth <= containerWidth) {
        tempVisibleTags.push(tags[i]);
      } else {
        tempHiddenTags.push(...tags.slice(i));
        break;
      }
    }

    // Now, check if adding "+N" tag causes overflow
    if (tempHiddenTags.length > 0) {
      let gapBeforeMoreTag = tempVisibleTags.length > 0 ? TAG_GAP : 0;
      const moreTagWidth = measureMoreTagWidth(tempHiddenTags.length);
      totalWidth += gapBeforeMoreTag + moreTagWidth;

      if (totalWidth > containerWidth) {
        // Remove tags from visibleTags until it fits
        while (totalWidth > containerWidth && tempVisibleTags.length > 0) {
          const lastTagIndex = tempVisibleTags.length - 1;
          const lastTagWidth = tagWidths[lastTagIndex];
          const gapBeforeLastTag = lastTagIndex > 0 ? TAG_GAP : 0;

          totalWidth -= gapBeforeLastTag + lastTagWidth;
          tempHiddenTags.unshift(tempVisibleTags.pop()!);

          // Recalculate totalWidth with new gap before "+N" tag
          const newGapBeforeMoreTag = tempVisibleTags.length > 0 ? TAG_GAP : 0;
          totalWidth -= gapBeforeMoreTag + moreTagWidth; // Remove previous "+N" tag
          gapBeforeMoreTag = newGapBeforeMoreTag;
          totalWidth += gapBeforeMoreTag + moreTagWidth; // Add updated "+N" tag

          if (totalWidth <= containerWidth) {
            break;
          }
        }
      }
    }

    setVisibleTags(tempVisibleTags);
    setHiddenTags(tempHiddenTags);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", ...container }}>
      {/* Hidden tag container for measurement */}
      <div
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          height: 0,
          overflow: "hidden",
        }}
      >
        {tags.map((tag, index) => (
          <Tag {...tagProps} key={index} ref={tagRefs.current[index]}>
            {tag}
          </Tag>
        ))}
      </div>
      {/* Visible tags */}
      <div style={{ display: "flex", flexWrap: "nowrap", overflow: "hidden", gap: `${TAG_GAP}px`, ...tagsContainer }}>
        {visibleTags.map((tag, index) => (
          <Tag {...tagProps} key={index}>
            {tag}
          </Tag>
        ))}
        {hiddenTags.length > 0 && (
          <Popover
            content={
              <Space wrap>
                {hiddenTags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Space>
            }
            {...popoverProps}
          >
            <Tag {...tagProps}>+{hiddenTags.length}</Tag>
          </Popover>
        )}
      </div>
    </div>
  );
}
