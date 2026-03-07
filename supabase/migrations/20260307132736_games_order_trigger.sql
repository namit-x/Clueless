CREATE OR REPLACE FUNCTION set_game_order_index()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_index IS NULL THEN
    SELECT COALESCE(MAX(order_index),0) + 1
    INTO NEW.order_index
    FROM games;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS assign_game_order ON games;

CREATE TRIGGER assign_game_order
BEFORE INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION set_game_order_index();