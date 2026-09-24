import { usePassiveBorderSpin } from "../../hooks/usePassiveBorderSpin";

/** Rotating conic border + static inner face (shared battle bar & skill equip). */
export function PassiveSkillSpinFrame() {
  const ringRef = usePassiveBorderSpin(true);

  return (
    <>
      <span
        ref={ringRef}
        className="passive-skill-spin__ring"
        aria-hidden="true"
      />
      <span className="passive-skill-spin__face" aria-hidden="true" />
    </>
  );
}
