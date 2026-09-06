export function SkipLinks() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-accent-500 focus:text-text-inverted focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <a
        href="#site-nav"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-accent-500 focus:text-text-inverted focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to navigation
      </a>
    </>
  );
}

// Tailwind doesn't have sr-only by default, add to globals.css:
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }
// .focus\:not-sr-only:focus {
//   position: static;
//   width: auto;
//   height: auto;
//   padding: inherit;
//   margin: inherit;
//   overflow: visible;
//   clip: auto;
//   white-space: normal;
// }
