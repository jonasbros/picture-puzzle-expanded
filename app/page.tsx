import { signOut } from "../lib/actions/auth";
export default function Home() {
  return (
    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      Cold-pressed bodega boys gorpcore offal cardigan blog. Pabst typewriter
      live-edge paleo pickled. Distillery swag unicorn mustache you probably
      haven't heard of them snackwave banh mi palo santo solarpunk DIY gatekeep
      vape intelligentsia YOLO. Twee small batch before they sold out, heirloom
      tofu kickstarter hot chicken vaporware swag fanny pack hoodie 3 wolf moon
      sus +1 green juice. Tumblr bitters helvetica air plant dreamcatcher. Food
      truck deep v tonx, synth cold-pressed austin direct trade letterpress
      retro tbh marxism echo park. Single-origin coffee microdosing mustache
      lomo gentrify marfa.
      <button
        className="btn btn-primary"
        onClick={async () => {
          "use server";
          signOut();
        }}
      >
        TEST
      </button>
    </main>
  );
}
