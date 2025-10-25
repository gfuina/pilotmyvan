import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import { put, del } from "@vercel/blob";

// POST - Add attachments to a maintenance record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceScheduleId: string; recordId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, maintenanceScheduleId, recordId } = await params;

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: user._id });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le record existe et appartient à l'utilisateur
    const record = await MaintenanceRecord.findOne({
      _id: recordId,
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
      userId: user._id,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Enregistrement non trouvé" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validation de la taille (max 10MB par fichier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `Le fichier ${file.name} est trop volumineux (max 10MB)` },
          { status: 400 }
        );
      }
    }

    // Upload des fichiers
    const uploadedAttachments = [];
    for (const file of files) {
      const blob = await put(
        `maintenance-attachments/${vehicleId}/${recordId}/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
        }
      );

      uploadedAttachments.push({
        url: blob.url,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    }

    // Ajouter les attachments au record
    record.attachments.push(...uploadedAttachments);
    await record.save();

    return NextResponse.json({
      message: "Fichiers ajoutés avec succès",
      attachments: uploadedAttachments,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload des fichiers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Remove an attachment from a maintenance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceScheduleId: string; recordId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, maintenanceScheduleId, recordId } = await params;
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL du fichier requise" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: user._id });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le record existe et appartient à l'utilisateur
    const record = await MaintenanceRecord.findOne({
      _id: recordId,
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
      userId: user._id,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Enregistrement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'attachment existe
    const attachmentIndex = record.attachments.findIndex((a) => a.url === url);
    if (attachmentIndex === -1) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le fichier de Vercel Blob
    try {
      await del(url);
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier de Blob:", error);
      // Continue même si la suppression échoue (le fichier n'existe peut-être plus)
    }

    // Retirer l'attachment du record
    record.attachments.splice(attachmentIndex, 1);
    await record.save();

    return NextResponse.json({
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

