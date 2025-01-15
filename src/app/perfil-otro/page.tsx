import { BentoGridPerfilOtro } from "./bento-perfil-otro/bento-perfil-otro";

export default function PerfilOtro( { username } ) {
  return (
    <main>
      <div>
        <BentoGridPerfilOtro username={username} />
      </div>
    </main>
  );
}
