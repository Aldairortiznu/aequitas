/**
 * Constantes de balance. Solo cambian con un ticket de balance
 * (docs/design/03-mecanicas.md). Los motores puros las leen de aquí.
 */
export const BALANCE = {
  audiencia: {
    danoPlena: 25,
    danoParcial: 10,
    danoInvocacion: 30,
    danoCotejo: 20,
    danoObjecion: 10,
    tensionFallida: 15,
    tensionPresionExcesiva: 5,
    tensionInvocacionFallida: 20,
    tensionPlena: -10,
    tensionInvocacionPlena: -20,
    tensionConvocarTestigo: -15,
    tensionEvidenciaFalsa: 20,
    posicionManiobra: 15,
    credibilidad: 3,
    credibilidadJurista: 2,
    tensionInicialJurista: 10,
    presionesAntesDeTension: 2,
  },
  pacto: {
    pesoLegalidad: 40,
    pesoIntereses: 30,
    pesoJusticia: 30,
    penalizacionNula: 20,
    bonoNulaDetectada: 5,
    tensionNulaFalsa: 10,
    umbralEjemplar: 85,
    umbralSolido: 60,
    umbralFragil: 40,
    penalizacionImpugnacion: 20,
  },
  legitimidad: {
    audiencia: 20,
    consulta: 3,
    testimonio: 2,
    folio: 1,
    pactoMax: 40,
    topes: {
      consulta: 18,
      testimonio: 20,
      folio: 12,
    } as Partial<
      Record<'audiencia' | 'pacto' | 'consulta' | 'testimonio' | 'folio' | 'evento', number>
    >,
  },
  interpelacion: {
    segundosNormal: 8,
  },
  mundo: {
    velocidad: 80,
    velocidadCorrer: 130,
    rangoInteraccion: 22,
    distanciaCompanero: 14,
    velocidadPatrulla: 40,
    conoVisionGrados: 70,
    conoVisionDistancia: 80,
  },
} as const;
