# ¿Qué es PANTERA?

El clásico juego del 3 en raya (Tic-Tac-Toe) elevado a un segundo nivel. Así como en el juego original, el objetivo es completar una línea, horizontal, vertical o diagonal, con tus fichas.

## ¿Cómo se juega?

En **Pantera** tienes un **macro tablero**, básicamente un tablero del 3 en raya pero en cada casilla existe un **mini tablero**.

Para marcar una casilla del **macro tablero** con tu ficha debes ganar la partida del **mini tablero** de esa misma casilla.

Así como en el juego original, Se considera **empate** cuando todas las casillas están ocupadas pero ningún jugador logró un 3 en raya.

## Casillas y mini tableros activos

Una **casilla activa** de un **mini tablero** es aquella que puede ser seleccionada por cualquier jugador y que no están marcadas con una ficha. Son fáciles de identificar porque se encuentran iluminadas con respecto al fondo y a otras casillas que se encuentren inactivas.

Un **mini tablero** activo es todo aquel que no está marcado con una ficha de jugador o se encuentra en estado de empate, por lo tanto al menos una de sus casillas se considera **activa**

## El truco

Al inicio puedes elegir cualquiera de las **casillas activas** de cualquier **mini tablero**, sin embargo cada jugada determinará el siguiente movimiento de tu contrincante.

Por ejemplo: Si eliges la casilla superior-izquierda de tu **mini tablero** activo, tu contrincante deberá jugar en el **mini tablero** superior-izquierdo. Si éste no se encuentra **activo**, podrá elegir cualquiera de las **casillas activas** de cualquier **mini tablero**
