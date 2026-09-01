export default function PhotosApp({ windowId: _ }: { windowId: string }) {
  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      <div className="h-10 bg-[#2d2d2d] flex items-center px-3 gap-2 shrink-0">
        <span>🖼️</span><span className="text-[13px] font-medium">Photos</span>
        <div className="ml-auto text-[11px] text-white/60">No photos — add images to Pictures folder</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded bg-white/5 flex items-center justify-center text-4xl mb-4">🖼️</div>
        <div className="text-[15px] font-semibold">No photos yet</div>
        <div className="text-[12px] text-white/60 mt-1 max-w-sm">Your Pictures folder is empty. Use File Explorer to add images.</div>
      </div>
    </div>
  );
}
