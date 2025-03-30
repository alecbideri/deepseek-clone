import React, { useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Markdown from "react-markdown";
import Prism from "prismjs";
import toast from "react-hot-toast";

const Message = ({ role, content }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  const likedMessage = () => {
    toast.success("Liked the response 🙂🙂!!");
  };
  const notLikedMessage = () => {
    toast.error("Disliked the response😔😔😔!!!!");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div
        className={`flex flex-col w-full mb-8 ${role === "user" && "items-end"}`}
      >
        <div
          className={`group relative flex max-w-2xl py-3 rounded-xl ${
            role === "user" ? "bg-another-dark px-5" : "gap-3"
          }`}
        >
          <div
            className={`opacity-0 group-hover:opacity-100 absolute ${
              role === "user"
                ? "-left-8 top-1/2 -translate-y-1/2"
                : "left-9 -bottom-6"
            } transition-all`}
          >
            <div className="flex flex-row items-center justify-center gap-2 opacity-70 w-fit flex-nowrap">
              {role === "user" ? (
                <>
                  <Image
                    src={assets.copy_icon}
                    alt="Copy Icon"
                    className="w-4"
                  />
                  <Image
                    src={assets.pencil_icon}
                    alt="Pencil Icon"
                    className="w-4"
                  />
                </>
              ) : (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt="Copy Icon"
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.regenerate_icon}
                    alt="Regenerate Icon"
                    className="w-4"
                  />
                  <Image
                    onClick={likedMessage}
                    src={assets.like_icon}
                    alt="Like Icon"
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    onClick={notLikedMessage}
                    src={assets.dislike_icon}
                    alt="Dislike Icon"
                    className="w-4 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
          {role === "user" ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt="Logo Icon"
                className="h-9 w-9 p-1"
              />
              <div className="space-y-4 w-full overflow-scroll">
                <Markdown>{content}</Markdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
