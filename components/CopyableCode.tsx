import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const CopyableCode = ({
  code,
  title,
  details,
}: {
  code: string;
  title: string;
  details?: string;
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <>
      {details && (
        <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
          {details}
        </p>
      )}
      {code && (
        <div className="mt-4">
          <label
            htmlFor="keyAuthorization"
            className="block text-sm font-bold mb-2"
          >
            {title}
          </label>
          <div className="flex items-center bg-gray-50 p-2 rounded-md">
            <code className="flex-1 text-sm break-all">{code}</code>
            <button
              onClick={handleCopy}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700"
              aria-label="Copy to clipboard"
            >
              {isCopied ? (
                <CheckIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
