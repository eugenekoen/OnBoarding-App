// Follow standard Deno guidelines for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY in Supabase secrets")
      return new Response(
        JSON.stringify({ error: "Supabase Secret 'RESEND_API_KEY' is not configured." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the incoming request payload
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to', 'subject', or 'html' in request body." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Retrieve sender email from environment or use default Resend trial sandbox email
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'

    // Owner's email to receive notifications (fallback to user's registered email)
    const ownerEmail = Deno.env.get('RESEND_TO_EMAIL') || 'eugenekoenn@gmail.com'

    console.log(`Processing onboarding submission. From: ${fromEmail}, Client: ${to}, Owner: ${ownerEmail}`)

    // 1. First, send the copy to the owner (this is guaranteed to work even on Resend free tier if owner is eugenekoenn@gmail.com)
    let ownerSendSuccess = false
    let ownerErrorDetail = null

    try {
      console.log(`Sending copy to Owner: ${ownerEmail}...`)
      const resendOwnerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [ownerEmail],
          subject: `[Owner Copy] ${subject}`,
          html: html,
        }),
      })

      const ownerData = await resendOwnerResponse.json()
      if (resendOwnerResponse.ok) {
        ownerSendSuccess = true
        console.log(`Successfully sent onboarding copy to owner! Email ID: ${ownerData.id}`)
      } else {
        ownerErrorDetail = ownerData
        console.error("Failed to send copy to owner:", ownerData)
      }
    } catch (e: any) {
      console.error("Error sending copy to owner:", e)
      ownerErrorDetail = e.message
    }

    // 2. Next, try sending to the client's email (to)
    let clientSendSuccess = false
    let clientErrorDetail = null

    // If the client's email is different from the owner's email, we attempt it.
    if (to.toLowerCase() !== ownerEmail.toLowerCase()) {
      try {
        console.log(`Attempting to send copy to Client: ${to}...`)
        const resendClientResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject: subject,
            html: html,
          }),
        })

        const clientData = await resendClientResponse.json()
        if (resendClientResponse.ok) {
          clientSendSuccess = true
          console.log(`Successfully sent copy to client! Email ID: ${clientData.id}`)
        } else {
          clientErrorDetail = clientData
          console.warn("Client email send rejected by Resend (expected if using Resend's free tier without a custom verified domain):", clientData)
        }
      } catch (e: any) {
        console.warn("Error sending copy to client:", e)
        clientErrorDetail = e.message
      }
    } else {
      clientSendSuccess = ownerSendSuccess
      clientErrorDetail = ownerErrorDetail
    }

    // Always succeed if at least the owner copy was sent successfully!
    // This prevents the submission form from throwing errors to the client,
    // ensuring a perfect, professional user experience.
    if (ownerSendSuccess) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: clientSendSuccess 
            ? "Emails sent successfully to both owner and client!" 
            : "Onboarding form submitted! (Notification sent to owner. Direct client email skipped due to Resend Free Plan limitations - verify a domain in Resend to enable client emails).",
          clientSendSuccess,
          clientErrorDetail,
          ownerSendSuccess
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If both failed, then return an error
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email notifications", 
        ownerErrorDetail,
        clientErrorDetail 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error("Unhandled exception in send-onboarding-email Edge Function:", error)
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

