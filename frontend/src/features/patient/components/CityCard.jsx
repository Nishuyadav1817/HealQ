import Card from './ui/PCard';

const CityCard = ({ city, onSelect }) => (
  <Card onClick={() => onSelect(city)}>
    <p className="font-display text-base font-semibold text-ink">{city.name}</p>
    <p className="text-sm text-ink-muted">
      {city.state}, {city.country}
    </p>
  </Card>
);

export default CityCard;
