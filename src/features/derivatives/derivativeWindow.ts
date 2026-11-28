import { capacityUsers, lastOperationalUser } from '../../config/domain';
import { responseViews } from '../dashboard/responseViews';

/** Ventana de la gráfica de función y tangente alrededor del punto elegido. */
export function tangentWindow(users: number) {
  const nearCapacity = users > capacityUsers * 0.75;
  return {
    curveStart: nearCapacity ? Math.max(0, users - 18) : 0,
    curveEnd: nearCapacity ? lastOperationalUser : responseViews.focus.end,
    tangentStart: Math.max(0, users - 12),
    tangentEnd: Math.min(lastOperationalUser, users + 12),
  };
}
