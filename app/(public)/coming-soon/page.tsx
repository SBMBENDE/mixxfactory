
import Image from 'next/image';

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <Image
        src="https://res.cloudinary.com/dkd3k6eau/image/upload/v1770166865/afrobizz_logo_vfrnli.png"
        alt="Afrobizz Coming Soon"
        width={400}
        height={400}
        className="mb-8"
        priority
      />
      <h1 className="text-white text-3xl font-bold mb-4 tracking-widest">COMING SOON</h1>
      <p className="text-gray-300 text-lg">Afrobizz is launching soon. Stay tuned!</p>
    </div>
  );
}
