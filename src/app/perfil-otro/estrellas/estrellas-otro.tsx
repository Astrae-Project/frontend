import { IconStar, IconStarFilled } from "@tabler/icons-react";
import "./estrellas-style.modules.css";

const StarRatingOtro = ({ puntuacionMedia }) => {
  const totalStars = 5;
  const filledStars = Math.floor(puntuacionMedia); // Estrellas completas
  const hasHalfStar = puntuacionMedia % 1 >= 0.5; // Si hay un medio (0.5 o más)
  const starFraction = parseFloat((puntuacionMedia - filledStars).toFixed(2)); // Parte fraccionaria de la puntuación (como número)

  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    if (i <= filledStars) {
      // Estrella completa
      stars.push(
        <span key={i} className="star filled">
          <IconStarFilled />
        </span>
      );
    } else if (i === filledStars + 1 && starFraction >= 0.1) {
      // Estrella parcial (puedes ajustarlo para mostrar menos de medio)
      stars.push(
        <span key={i} className="star half">
          <IconStarFilled className="half-filled" />
        </span>
      );
    } else {
      // Estrella vacía
      stars.push(
        <span key={i} className="star">
          <IconStar />
        </span>
      );
    }
  }

  return <div className="star-rating">{stars}</div>;
};

export default StarRatingOtro;
