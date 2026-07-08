import statistics


class ScoringService:
    """
    Calculates pronunciation metrics from Whisper transcription.
    """

    FILLER_WORDS = {
        "um",
        "uh",
        "hmm",
        "like",
        "you know",
        "actually",
        "basically",
        "so"
    }

    def calculate_metrics(self, transcription: dict) -> dict:

        words = transcription.get("words", [])
        duration = max(transcription.get("duration", 1), 1)

        if not words:
            return {
                "overall_score": 0,
                "clarity": 0,
                "fluency": 0,
                "wpm": 0,
                "confidence": 0,
                "grade": "Poor",
                "strengths": [],
                "focus_areas": [
                    "No speech detected."
                ],
                "word_feedback": []
            }

        # ---------------------------------------
        # Pronunciation Clarity
        # ---------------------------------------

        confidences = [
            max(0, min(1, word.get("probability", 0)))
            for word in words
        ]

        clarity = statistics.mean(confidences)

        # ---------------------------------------
        # Speaking Speed
        # ---------------------------------------

        total_words = len(words)

        wpm = (total_words / duration) * 60

        if 110 <= wpm <= 160:
            fluency = 1.0

        elif wpm < 110:
            fluency = max(0.5, wpm / 110)

        else:
            fluency = max(0.5, 160 / wpm)

        # ---------------------------------------
        # Filler Words
        # ---------------------------------------

        filler_count = 0

        for word in words:

            if word["word"].lower().strip() in self.FILLER_WORDS:
                filler_count += 1

        filler_penalty = min(filler_count * 0.02, 0.10)

        # ---------------------------------------
        # Final Score
        # ---------------------------------------

        overall = (
            clarity * 0.65 +
            fluency * 0.35
        )

        overall = max(0, overall - filler_penalty)

        confidence = clarity * 100

        # ---------------------------------------
        # Grade
        # ---------------------------------------

        score = overall * 100

        if score >= 90:
            grade = "Excellent"

        elif score >= 80:
            grade = "Very Good"

        elif score >= 70:
            grade = "Good"

        elif score >= 60:
            grade = "Fair"

        else:
            grade = "Needs Improvement"

        # ---------------------------------------
        # Strengths & Focus Areas
        # ---------------------------------------

        strengths = []
        focus = []

        if clarity >= 0.90:
            strengths.append(
                "Excellent pronunciation clarity."
            )

        elif clarity >= 0.80:
            strengths.append(
                "Generally clear pronunciation."
            )

        else:
            focus.append(
                "Pronounce words more clearly."
            )

        if fluency >= 0.90:
            strengths.append(
                "Natural speaking pace."
            )

        else:
            focus.append(
                "Maintain a more consistent speaking speed."
            )

        if filler_count == 0:
            strengths.append(
                "No unnecessary filler words."
            )

        else:
            focus.append(
                f"Reduce filler words ({filler_count} detected)."
            )

        # ---------------------------------------
        # Per-word Feedback
        # ---------------------------------------

        feedback = []

        for word in words:

            probability = word.get("probability", 0)

            if probability >= 0.90:

                status = "Excellent"
                suggestion = "Very clear pronunciation."

            elif probability >= 0.75:

                status = "Good"
                suggestion = "Minor pronunciation improvements possible."

            else:

                status = "Needs Practice"
                suggestion = "Repeat this word more clearly."

            feedback.append({

                "word": word["word"],

                "confidence": round(
                    probability * 100,
                    2
                ),

                "status": status,

                "suggestion": suggestion

            })

        # ---------------------------------------

        return {

            "overall_score": round(score, 2),

            "grade": grade,

            "clarity": round(
                clarity * 100,
                2
            ),

            "fluency": round(
                fluency * 100,
                2
            ),

            "confidence": round(
                confidence,
                2
            ),

            "wpm": round(
                wpm,
                2
            ),

            "strengths": strengths,

            "focus_areas": focus,

            "word_feedback": feedback

        }


scoring_service = ScoringService()