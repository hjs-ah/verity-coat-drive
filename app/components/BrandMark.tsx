interface BrandMarkProps {
  logoUrl?: string | null;
}

/**
 * Reusable footer brand mark.
 *
 * Centered, 50% opacity, sits below the page content. Renders whatever
 * image is set in the "Logo" field on the Site Text row in Notion; falls
 * back to the bundled Verity wordmark if none is set.
 *
 * The fallback mark is black brush-script on a transparent background, so
 * it's inverted to white in dark mode to stay visible against the dark
 * background. A custom logo uploaded through Notion is shown as-is
 * (without the invert filter) since it may already be colored.
 *
 * Intended as a shared template element — drop `public/brand/verity-mark.png`
 * and this component into future Verity/VOW Center projects to keep the
 * same footer treatment consistent across sites.
 */
export default function BrandMark({ logoUrl }: BrandMarkProps) {
  const useDefault = !logoUrl;

  return (
    <div className="mt-14 flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={useDefault ? "/brand/verity-mark.png" : logoUrl}
        alt="Verity"
        className={`h-auto w-36 opacity-50 sm:w-44 ${useDefault ? "dark:invert" : ""}`}
      />
    </div>
  );
}
