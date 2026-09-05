function ForensicModal({ open, title, description, children, onClose, maxWidth = "max-w-lg" }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
            <div className={`max-h-[90vh] w-full ${maxWidth} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl`}>
                <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    </div>

                    <button type="button" onClick={onClose} className="rounded-lg p-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        ×
                    </button>
                </div>

                <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

export default ForensicModal;