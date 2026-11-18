import { Image } from "@/components/ui/image";
import "@/components/coord/prevencionista.css";

const SRC = "https://media.base44.com/images/public/6acfba2bbe6123d4e500ba2b/609affea7_generated_image.png";

// Prevencionista en 3D, fundido con la cabecera y con una leve flotación.
export default function Prevencionista({ className = "" }) {
  return (
    <div className={"prev3d " + className} aria-hidden="true">
      <Image src={SRC} alt="" className="w-full h-full" fittingType="fill" focalPointY={0.3} />
    </div>
  );
}