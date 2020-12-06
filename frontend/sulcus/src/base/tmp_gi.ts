

class ModèlePhysiqueDeValidation {

    // Bootstrap + géométrie inertielle + modèle fluide
}

interface PeutVoler {
 
    // I believe I can fly
}

class Oiseau implements PeutVoler {

    // plumes, etc
}

class Mammifère {

    // bla bla bla placenta toussa
}

class Humain extends Mammifère {

    // Un humain "est un" mammifère
 }

class SuperhérosAilé implements Humain, Oiseau {

    // Ange : Mammifère placentaire pouvant voler... ou pas.
} 

class SimulateurValidateurPhysique {

    modèle: ModèlePhysiqueDeValidation

    // Résultat : La class SuperhérosAilé défie les lois de la gravité
}

