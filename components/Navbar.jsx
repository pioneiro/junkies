import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="h-16 px-8 md:px-16 lg:px-32 flex justify-between items-center gap-8 sticky top-0">
      <h1 className="text-4xl font-semibold">Junkies</h1>

      <ul className="flex justify-center gap-4 text-xl">
        <li className="p-2 relative group">
          <button onClick={session ? null : signIn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="bi bi-person h-8 w-8"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
            </svg>
          </button>

          {session && (
            <ul className="w-32 absolute flex flex-col invisible group-hover:visible opacity-0 group-hover:opacity-100 border-2 top-32 group-hover:top-full -right-2 transition-all cursor-pointer">
              <li className="px-2 py-1 border-2 hover:bg-gray-100">
                <Link href="/profile">Profile</Link>
              </li>
              <li
                className="px-2 py-1 border-2 hover:bg-gray-100"
                onClick={signOut}
              >
                Log Out
              </li>
            </ul>
          )}
        </li>
        <li className="p-2">
          <Link href="/cart">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="bi bi-cart3 h-8 w-8"
              >
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
