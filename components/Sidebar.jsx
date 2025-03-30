import React, { useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useClerk, UserButton } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import ChatLabel from "@/components/ChatLabel";

const Sidebar = ({ expand, setExpand }) => {
  const { openSignIn } = useClerk();
  const { user, chats, createNewChat } = useAppContext();
  const [openMenu, setOpenMenu] = useState({ id: 0, open: false });

  return (
    <div
      className={`flex flex-col justify-between bg-darker pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${
        expand ? "p-4 w-64" : "md:w-20 w-0 max-md:overflow-hidden"
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo and Menu Toggle */}
        <div
          className={`flex ${
            expand ? "flex-row gap-10" : "flex-col items-center gap-8"
          }`}
        >
          <Image
            className={expand ? "w-36" : "w-10"}
            src={expand ? assets.logo_text : assets.logo_icon}
            alt="Logo"
          />
          <div
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer"
            onClick={() => setExpand(!expand)}
          >
            <Image
              src={assets.menu_icon}
              alt="Menu"
              className="md:hidden w-7"
            />
            <Image
              src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
              alt="Sidebar Toggle"
              className="hidden md:block w-7"
            />
            <div
              className={`absolute w-max text-sm bg-black text-white px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none ${
                expand ? "left-1/2 -translate-x-1/2 top-12" : "left-0 top-12"
              }`}
            >
              {expand ? "Close sidebar" : "Open sidebar"}
              <div
                className={`w-3 h-3 absolute bg-black rotate-45 ${
                  expand
                    ? "left-1/2 -top-1.5 -translate-x-1/2"
                    : "left-4 -top-1.5"
                }`}
              />
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className={`mt-8 flex items-center justify-center cursor-pointer ${
            expand
              ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
              : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
          }`}
        >
          <Image
            className={expand ? "w-6" : "w-7"}
            src={expand ? assets.chat_icon : assets.chat_icon_dull}
            alt="New Chat"
          />
          {!expand && (
            <div className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              New chat
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5" />
            </div>
          )}
          {expand && <p className="text-white font-medium">New chat</p>}
        </button>

        {/* Recents */}
        {expand && (
          <div className="mt-8 text-white/25 text-sm">
            <p className="my-1">Recents</p>
            {chats.map((chat) => (
              <ChatLabel
                key={chat._id} // Added key prop here
                name={chat.name}
                id={chat._id}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2">
        {/* Get App */}
        <div
          className={`flex items-center cursor-pointer group relative ${
            expand
              ? "gap-1 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/10"
              : "h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg"
          }`}
        >
          <Image
            className={expand ? "w-5" : "w-6 mx-auto"}
            src={expand ? assets.phone_icon : assets.phone_icon_dull}
            alt="Get App"
          />
          {expand && (
            <div className="absolute w-max bottom-full mb-2 left-0 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm p-3 rounded-lg shadow-lg pointer-events-none z-50">
              <Image src={assets.qrcode} alt="QR Code" className="w-44" />
              <p>Scan to get DeepSeek App</p>
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5" />
            </div>
          )}
          {expand && (
            <>
              <span>Get App</span>
              <Image src={assets.new_icon} alt="New" />
            </>
          )}
        </div>

        {/* User Profile */}
        <div
          onClick={user ? null : openSignIn}
          className={`flex items-center cursor-pointer ${
            expand
              ? "gap-3 text-white/60 text-sm p-2 hover:bg-white/10"
              : "justify-center w-full h-10 hover:bg-gray-500/30 rounded-lg"
          }`}
        >
          {user ? (
            <UserButton />
          ) : (
            <Image src={assets.profile_icon} alt="Profile" className="w-7" />
          )}

          {expand && <span>My profile</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
