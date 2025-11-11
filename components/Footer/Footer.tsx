export default function Footer() {
    return (
        <footer className=" px-4 sm:px-6 lg:px-8 mt-auto w-full">
            <div className="text-white/40 text-xs flex row justify-end items-center pb-2 max-w-7xl mx-auto ">
                <p>
                    Made by
                    <a
                        href="https://www.charlescon.com/"
                        className={`hover:text-white pl-1 underline`}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Charles
                    </a>{" "}
                    {":)"}
                </p>
            </div>
        </footer>
    );
}
