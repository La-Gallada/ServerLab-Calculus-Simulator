/** Ventana de la gráfica de función y tangente alrededor del punto elegido. */
export function tangentWindow(users: number) {
  return {
    curveStart: users > 75 ? Math.max(0, users - 18) : 0,
    curveEnd: users > 75 ? 99 : 80,
    tangentStart: Math.max(0, users - 12),
    tangentEnd: Math.min(99, users + 12),
  };
}
