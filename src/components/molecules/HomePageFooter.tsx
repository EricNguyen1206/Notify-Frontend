import Image from "next/image";
import Link from "next/link";


const HomePageFooter = () => {
  return (
    <div className="bg-primary-gray text-white px-4 md:px-0">
      <div className="w-[100%] md:w-[70%] py-[100px] mx-auto flex flex-wrap justify-between">
        <div className="w-[100%] flex flex-wrap gap-10 items-start justify-between">

        </div>
        <div className="w-[100%] h-[2px] bg-primary-purple my-10"></div>
        <div className="w-[100%] flex justify-between">
          <Image className="w-[120px] h-auto" src="/images/nav-icon.svg" width="0" height="0" alt="icon" />
          <Link href={"/login"}>
            <div
              className="bg-primary-purple rounded-3xl px-4 py-3 text-sm font-bold
                            hover:bg-secondary-purple"
            >
              Open Notify
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePageFooter;
