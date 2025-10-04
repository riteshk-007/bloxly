'use client';

import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';

export function ContentEditable({ placeholder = 'Start typing...', className = '' }) {
    return (
        <LexicalContentEditable
            className={`
        min-h-[500px] 
        w-full 
        bg-gray-900 
        text-white 
        p-4 
        border-0 
        outline-none 
        resize-none 
        font-normal 
        text-base 
        leading-relaxed
        ${className}
      `}
            placeholder={
                <div className="text-gray-400 pointer-events-none absolute top-4 left-4">
                    {placeholder}
                </div>
            }
        />
    );
}